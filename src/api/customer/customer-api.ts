import request from "@/utils/request";

const CUSTOMER_BASE_URL = "/api/v1/customer";

const CustomerAPI = {
  /** 获取顾客信息分页数据 */
  getPage(queryParams?: CustomerPageQuery) {
    return request<any, PageResult<CustomerPageVO[]>>({
      url: `${CUSTOMER_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取顾客信息表单数据
   *
   * @param id 顾客信息ID
   * @returns 顾客信息表单数据
   */
  getFormData(id: number) {
    return request<any, CustomerForm>({
      url: `${CUSTOMER_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   *  添加顾客信息
   *
   *  @param data 顾客信息表单数据
   */
  create(data: CustomerForm) {
    return request({
      url: `${CUSTOMER_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新顾客信息
   *
   * @param id 顾客信息ID
   * @param data 顾客信息表单数据
   */
  update(id: string, data: CustomerForm) {
    return request({
      url: `${CUSTOMER_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除顾客信息，多个以英文逗号(,)分割
   *
   * @param ids 顾客信息ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${CUSTOMER_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default CustomerAPI;

/** 顾客信息分页查询参数 */
export interface CustomerPageQuery extends PageQuery {
  /** 手机号码（模糊搜索） */
  phone?: string;
}

/** 顾客信息表单对象 */
export interface CustomerForm {
  /** 主键ID */
  id?: number;
  /** 顾客姓名 */
  name?: string;
  /** 手机号码（可作为唯一标识） */
  phone?: string;
  /** 性别：male-男, female-女, unknown-未知 */
  gender?: string;
  /** 生日（用于客户关怀和营销） */
  birthday?: Date;
  /** 顾客来源：如"大众点评"、"朋友推荐"、"线下自然流量"等 */
  source?: string;
  /** 备注信息：顾客偏好、特殊需求、病史等 */
  notes?: string;
}

/** 顾客信息分页对象 */
export interface CustomerPageVO {
  /** 主键ID */
  id?: number;
  /** 顾客姓名 */
  name?: string;
  /** 手机号码（可作为唯一标识） */
  phone?: string;
  /** 性别：male-男, female-女, unknown-未知 */
  gender?: string;
  /** 生日（用于客户关怀和营销） */
  birthday?: Date;
  /** 顾客来源：如"大众点评"、"朋友推荐"、"线下自然流量"等 */
  source?: string;
  /** 顾客标签：JSON数组格式，如["高价值客户", "儿童", "价格敏感"] */
  tags?: string;
  /** 会员等级：如"普通","银卡","金卡","钻石" */
  memberLevel?: string;
  /** 账户余额（储值金额） */
  balance?: number;
  /** 备注信息：顾客偏好、特殊需求、病史等 */
  notes?: string;
  /** 软删除标记：0-未删除, 1-已删除 */
  isDeleted?: number;
  /** 记录创建时间 */
  createTime?: string;
  /** 记录最后更新时间 */
  updateTime?: string;
}
