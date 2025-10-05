import request from "@/utils/request";

const BRAND_BASE_URL = "/api/v1/brand";

const BrandAPI = {
  /** 获取品牌分页数据 */
  getPage(queryParams?: BrandPageQuery) {
    return request<any, PageResult<BrandPageVO[]>>({
      url: `${BRAND_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取品牌下拉数据源 */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${BRAND_BASE_URL}/options`,
      method: "get",
    });
  },
  /**
   * 获取品牌表单数据
   *
   * @param id 品牌ID
   * @returns 品牌表单数据
   */
  getFormData(id: number) {
    return request<any, BrandForm>({
      url: `${BRAND_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   *  添加品牌
   *
   *  @param data 品牌表单数据
   */
  create(data: BrandForm) {
    return request({
      url: `${BRAND_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新品牌
   *
   * @param id 品牌ID
   * @param data 品牌表单数据
   */
  update(id: string, data: BrandForm) {
    return request({
      url: `${BRAND_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除品牌，多个以英文逗号(,)分割
   *
   * @param ids 品牌ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${BRAND_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default BrandAPI;

/** 品牌分页查询参数 */
export interface BrandPageQuery extends PageQuery {
  /** 品牌名称 */
  name?: string;
  /** 品牌分类 */
  category?: string;
  /** 价格等级 */
  priceLevel?: string;
  /** 是否热门 */
  isPopular?: number;
  /** 状态 */
  status?: number;
}

/** 品牌表单对象 */
export interface BrandForm {
  /** 品牌ID */
  id?: number;
  /** 品牌名称 */
  name?: string;
  /** 英文名称 */
  englishName?: string;
  /** 原产国 */
  originCountry?: string;
  /** 品牌分类 */
  category?: string;
  /** 价格等级 */
  priceLevel?: string;
  /** 品牌Logo URL */
  logoUrl?: string;
  /** 是否热门 */
  isPopular?: number;
  /** 状态 */
  status?: number;
  /** 排序值，越大越靠前 */
  sortOrder?: number;
  /** 品牌描述 */
  description?: string;
}

/** 品牌分页对象 */
export interface BrandPageVO {
  /** 品牌ID */
  id?: number;
  /** 品牌名称 */
  name?: string;
  /** 英文名称 */
  englishName?: string;
  /** 原产国 */
  originCountry?: string;
  /** 品牌分类 */
  category?: string;
  /** 价格等级 */
  priceLevel?: string;
  /** 品牌Logo URL */
  logoUrl?: string;
  /** 是否热门 */
  isPopular?: number;
  /** 状态 */
  status?: number;
  /** 排序值，越大越靠前 */
  sortOrder?: number;
  /** 品牌描述 */
  description?: string;
  createTime?: string;
  updateTime?: string;
}
