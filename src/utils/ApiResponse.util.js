class ApiResponse {
  constructor({
    statusCode = 200,
    success = true,
    message = "",
    data = null,
    pagination = null,
  }) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;

    if (pagination) {
      this.pagination = {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNextPage: pagination.page * pagination.limit < pagination.total,
        hasPrevPage: pagination.page > 1,
      };
    }
  }
}

module.exports = ApiResponse;