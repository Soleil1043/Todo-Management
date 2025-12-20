from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Response
from sqlalchemy.orm import Session
from database.database import get_db
from services.setting_service import SettingService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def get_setting_service(db: Session = Depends(get_db)) -> SettingService:
    return SettingService(db)

@router.post("/settings/wallpaper", summary="上传自定义壁纸", description="接收并存储用户上传的背景壁纸图片")
async def upload_wallpaper(
    file: UploadFile = File(...),
    service: SettingService = Depends(get_setting_service)
):
    # 50MB limit
    MAX_SIZE = 50 * 1024 * 1024
    
    # Read file content
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail="文件大小超过50MB限制")
        
        content_type = file.content_type or "image/jpeg"
        logger.info(f"Uploading wallpaper: {file.filename}, type={content_type}, size={len(content)}")
        
        service.save_wallpaper(content, content_type)
        return {"message": "壁纸上传成功"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"上传壁纸失败: {e}")
        raise HTTPException(status_code=500, detail="上传壁纸失败")
    finally:
        await file.close()

@router.get("/settings/wallpaper", summary="获取当前壁纸", description="检索当前设置的背景壁纸图片数据")
async def get_wallpaper(service: SettingService = Depends(get_setting_service)):
    result = service.get_wallpaper()
    if not result:
        raise HTTPException(status_code=404, detail="未设置壁纸")
    
    data, content_type = result
    # 确保 content_type 合法
    if not content_type or '/' not in content_type:
        content_type = "image/jpeg"
        
    return Response(
        content=data, 
        media_type=content_type, 
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

@router.delete("/settings/wallpaper", summary="删除当前壁纸", description="从系统中移除当前设置的背景壁纸")
def delete_wallpaper(service: SettingService = Depends(get_setting_service)):
    service.delete_wallpaper()
    return {"message": "壁纸已删除"}
