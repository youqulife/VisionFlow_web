import request from "@/utils/request";

const EYEEXAM_BASE_URL = "/api/v1/eye-exam";

const EyeExamAPI = {
  /** 获取验光记录分页数据 */
  getPage(queryParams?: EyeExamPageQuery) {
    return request<any, PageResult<EyeExamPageVO[]>>({
      url: `${EYEEXAM_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取验光记录表单数据
   *
   * @param id 验光记录ID
   * @returns 验光记录表单数据
   */
  getFormData(id: number) {
    return request<any, EyeExamForm>({
      url: `${EYEEXAM_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   *  添加验光记录
   *
   *  @param data 验光记录表单数据
   */
  create(data: EyeExamForm) {
    return request({
      url: `${EYEEXAM_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新验光记录
   *
   * @param id 验光记录ID
   * @param data 验光记录表单数据
   */
  update(id: string, data: EyeExamForm) {
    return request({
      url: `${EYEEXAM_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除验光记录，多个以英文逗号(,)分割
   *
   * @param ids 验光记录ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${EYEEXAM_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default EyeExamAPI;

/** 验光记录分页查询参数 */
export interface EyeExamPageQuery extends PageQuery {}

/** 验光记录表单对象 */
export interface EyeExamForm {
  /** 主键ID */
  id?: number;
  /** 关联的顾客ID */
  customerId?: number;
  /** 顾客名称 */
  customerName?: string;
  /** 顾客手机号 */
  customerPhone?: string;
  /** 验光日期 */
  examDate?: Date;
  /** 验光师 */
  optometrist?: string;
  /** 验光类型 */
  examType?: string;
  /** 右眼球镜 */
  odSph?: number;
  /** 右眼柱镜 */
  odCyl?: number;
  /** 右眼轴位 */
  odAxis?: number;
  /** 右眼瞳距 */
  odPd?: number;
  /** 左眼球镜 */
  osSph?: number;
  /** 左眼柱镜 */
  osCyl?: number;
  /** 左眼轴位 */
  osAxis?: number;
  /** 左眼瞳距 */
  osPd?: number;
  /** 双眼瞳距 */
  pdTotal?: number;
  /** 下加光 */
  addition?: number;
  /** 带镜史数据 */
  wearingHistory?: string;
  /** 是否有戴镜史 */
  hasGlassesHistory?: number;
  /** 是否首次验光 */
  isFirstExam?: number;
}

/** 验光记录分页对象 */
export interface EyeExamPageVO {
  /** 主键ID */
  id?: number;
  /** 关联的顾客ID */
  customerId?: number;
  /** 顾客名称 */
  customerName?: string;
  /** 顾客手机号 */
  customerPhone?: string;
  /** 验光日期 */
  examDate?: Date;
  /** 验光师 */
  optometrist?: string;
  /** 验光类型 */
  examType?: string;
  /** 右眼球镜 */
  odSph?: number;
  /** 右眼柱镜 */
  odCyl?: number;
  /** 右眼轴位 */
  odAxis?: number;
  /** 右眼瞳距 */
  odPd?: number;
  /** 左眼球镜 */
  osSph?: number;
  /** 左眼柱镜 */
  osCyl?: number;
  /** 左眼轴位 */
  osAxis?: number;
  /** 左眼瞳距 */
  osPd?: number;
  /** 双眼瞳距 */
  pdTotal?: number;
  /** 下加光 */
  addition?: number;
  /** 带镜史数据 */
  wearingHistory?: string;
  /** 是否有戴镜史 */
  hasGlassesHistory?: number;
  /** 是否首次验光 */
  isFirstExam?: number;
  isDeleted?: number;
  createTime?: Date;
  updateTime?: Date;
}
