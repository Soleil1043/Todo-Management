from typing import Tuple

def calculate_priority(importance: int, urgency: int) -> int:
    """
    基于四象限管理法的优先级计算算法
    
    参数:
        importance: 重要性评分, 范围 [-3, 3]
        urgency: 紧急性评分, 范围 [-3, 3]
    
    返回:
        priority: 优先级数值 (范围 100-500, 越大越优先)
    """
    
    # 防御性检查
    if not (-3 <= importance <= 3 and -3 <= urgency <= 3):
        raise ValueError("importance和urgency必须在[-3, 3]范围内")
    
    # 1. 确定象限基础分 (确保Q2 > Q3)
    # Q1: 重要且紧急 → 400
    # Q2: 重要不紧急 → 300
    # Q3: 不重要但紧急 → 200
    # Q4: 不重要不紧急 → 100
    if importance > 0:
        base_priority = 400 if urgency > 0 else 300
    else:
        base_priority = 200 if urgency > 0 else 100
    
    # 2. 计算象限内排序分 (0-99)
    # 每个象限采用不同的内部排序策略
    if base_priority == 400:  # Q1: 重要且紧急
        # 两者之和越大越优先 (范围: 2-6 → 映射到 32-96)
        intra_score = (importance + urgency) * 16
        
    elif base_priority == 300:  # Q2: 重要不紧急
        # 重要性越高越优先 (范围: 1-3 → 映射到 33-99)
        intra_score = importance * 33
        
    elif base_priority == 200:  # Q3: 紧急不重要
        # 紧急性越高越优先 (范围: 1-3 → 映射到 33-99)
        intra_score = urgency * 33
        
    else:  # Q4: 不重要不紧急 (base_priority == 100)
        # 负值越小越不优先，用补值计算 (范围: -6到-2 → 映射到 32-96)
        intra_score = (6 + importance + urgency) * 16
    
    # 3. 最终优先级
    final_priority = base_priority + int(intra_score)
    
    return final_priority

def get_quadrant_info(importance: int, urgency: int) -> Tuple[str, str]:
    """
    获取象限信息
    
    参数:
        importance: 重要性评分, 范围 [-3, 3]  
        urgency: 紧急性评分, 范围 [-3, 3]
    
    返回:
        (象限名称, 象限颜色)
    """
    if importance > 0 and urgency > 0:
        return "Q1 - 重要且紧急", "#ffebee"  # 浅红色
    elif importance > 0 and urgency <= 0:
        return "Q2 - 重要不紧急", "#e8f5e8"  # 浅绿色
    elif importance <= 0 and urgency > 0:
        return "Q3 - 不重要但紧急", "#fff3e0"  # 浅橙色
    else:
        return "Q4 - 不重要不紧急", "#f3e5f5"  # 浅紫色