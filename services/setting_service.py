from sqlalchemy.orm import Session
from database.orm_models import SystemSettingORM
from typing import Optional, Tuple

class SettingService:
    def __init__(self, db: Session):
        self.db = db

    def save_wallpaper(self, image_data: bytes, content_type: str):
        setting = self.db.query(SystemSettingORM).filter(SystemSettingORM.key == "wallpaper").first()
        if not setting:
            setting = SystemSettingORM(key="wallpaper")
            self.db.add(setting)
        
        setting.blob_value = image_data
        setting.content_type = content_type
        self.db.commit()
        return True

    def get_wallpaper(self) -> Optional[Tuple[bytes, str]]:
        setting = self.db.query(SystemSettingORM).filter(SystemSettingORM.key == "wallpaper").first()
        if setting and setting.blob_value:
            return setting.blob_value, setting.content_type or "image/jpeg"
        return None

    def delete_wallpaper(self):
        setting = self.db.query(SystemSettingORM).filter(SystemSettingORM.key == "wallpaper").first()
        if setting:
            setting.blob_value = None
            setting.content_type = None
            self.db.commit()
        return True
