#!/usr/bin/env node

const { execSync } = require("child_process");
const { readFileSync } = require("fs");
const { join } = require("path");

const PATTERNS = [
  { label: "AWS access key id", regex: /AKIA[0-9A-Z]{16}/ },
  { label: "AWS temporary access key id", regex: /ASIA[0-9A-Z]{16}/ },
  { label: "Google API key", regex: /AIza[0-9A-Za-z\-_]{35}/ },
  { label: "Facebook access token", regex: /EAACEdEose0cBA[0-9A-Za-z]{32}/ },
  { label: "Slack token", regex: /xox[baprs]-[0-9A-Za-z]{10,48}/ },
  { label: "Private key block", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: "AWS secret key literal", regex: /aws_secret_access_key/i },
  { label: "Client secret literal", regex: /client_secret/i },
  { label: "API key literal", regex: /api_key/i },
  { label: "Secret key literal", regex: /secret_key/i },
];

const args = process.argv.slice(2);
const options = { staged: args.includes("--staged") };

function run(command) {
  return execSync(command, { encoding: "utf8" });
}

function gatherTargets() {
  if (options.staged) {
    const stagedList = run("git diff --cached --name-only --diff-filter=ACMRT")
      .split("\n")
      .filter(Boolean)
      .filter((path) => path !== "infra/scripts/secret-scan.js");

    return stagedList
      .map((relativePath) => {
        try {
          const escaped = relativePath.replace(/[\\"$`]/g, "\\$&");
          const content = run(`git show :"${escaped}"`);
          return { path: relativePath, content };
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);
  }

  const root = run("git rev-parse --show-toplevel").trim();
  const filesList = run("git ls-files").split("\n").filter(Boolean);

  return filesList
    .filter((relativePath) => relativePath !== "infra/scripts/secret-scan.js")
    .map((relativePath) => {
      const filePath = join(root, relativePath);
      try {
        return { path: relativePath, content: readFileSync(filePath, "utf8") };
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
}

function scan(targets) {
  const findings = [];

  for (const { path, content } of targets) {
    for (const { label, regex } of PATTERNS) {
      const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
      const matcher = new RegExp(regex.source, flags);
      let match;

      while ((match = matcher.exec(content)) !== null) {
        const snippet = match[0];
        const position = getLineColumn(content, match.index);
        findings.push({
          label,
          path,
          line: position.line,
          column: position.column,
        });

        if (snippet.length === 0) {
          matcher.lastIndex += 1;
        }
      }
    }
  }

  return findings;
}

function getLineColumn(text, index) {
  let line = 1;
  let column = 1;

  for (let i = 0; i < index; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

function main() {
  let targets;

  try {
    targets = gatherTargets();
  } catch (error) {
    console.error("secret-scan: unable to gather git context");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }

  const findings = scan(targets);

  if (findings.length > 0) {
    console.error(
      "\nERROR secret scan blocked due to potential sensitive data.\n",
    );
    findings.forEach(({ label, path, line, column }) => {
      console.error(`- ${label} in ${path} ${line}:${column}`);
    });
    console.error(
      "\nPlease remove or secure these secrets before continuing.\n",
    );
    process.exit(1);
  }
}

main();
