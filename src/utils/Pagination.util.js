class PaginationResponse {
  constructor(total, page, limit) {
    this.total = total;
    this.page = page;
    this.limit = limit;

    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

module.exports = PaginationResponse;