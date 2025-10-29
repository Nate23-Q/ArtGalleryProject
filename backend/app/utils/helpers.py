def paginate_query(query, page: int = 1, per_page: int = 20):
    page = max(1, int(page))
    per_page = max(1, int(per_page))
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return pagination
