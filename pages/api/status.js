function status(request, response) {
    response.status(200).json({"teste": "valóõr"});
}

export default status;