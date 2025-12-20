from fastapi import status

class TodoAppException(Exception):
    """基础异常类"""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class EntityNotFoundException(TodoAppException):
    """实体未找到异常"""
    def __init__(self, message: str = "未找到请求的实体"):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)

class ValidationException(TodoAppException):
    """业务逻辑验证失败异常"""
    def __init__(self, message: str = "数据验证失败"):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)

class DatabaseException(TodoAppException):
    """数据库操作失败异常"""
    def __init__(self, message: str = "数据库操作失败"):
        super().__init__(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
