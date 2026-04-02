class ApiResponse {
  constructor({
    statusCode = 200,
    success = true,
    message = "",
    data = null,
    pagination=null
  }) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination
  }
}

module.exports = ApiResponse;