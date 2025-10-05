import request from "@/utils/request";

const CATEGORY_BASE_URL = "/api/v1/category";

const CategoryAPI = {
  /** 获取商品分类分页数据 */
  getPage(queryParams?: CategoryPageQuery) {
    return request<any, PageResult<CategoryPageVO[]>>({
      url: `${CATEGORY_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取商品分类树形列表 */
  getList(queryParams?: CategoryQuery) {
    return request<any, CategoryVO[]>({
      url: `${CATEGORY_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取商品分类下拉数据源 */
  getOptions(onlyParent?: boolean) {
    return request<any, OptionType[]>({
      url: `${CATEGORY_BASE_URL}/options`,
      method: "get",
      params: { onlyParent },
    });
  },
  /**
   * 获取商品分类表单数据
   *
   * @param id 商品分类ID
   * @returns 商品分类表单数据
   */
  getFormData(id: number) {
    return request<any, CategoryForm>({
      url: `${CATEGORY_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   *  添加商品分类
   *
   *  @param data 商品分类表单数据
   */
  create(data: CategoryForm) {
    return request({
      url: `${CATEGORY_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新商品分类
   *
   * @param id 商品分类ID
   * @param data 商品分类表单数据
   */
  update(id: string, data: CategoryForm) {
    return request({
      url: `${CATEGORY_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除商品分类，多个以英文逗号(,)分割
   *
   * @param ids 商品分类ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${CATEGORY_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default CategoryAPI;

/** 商品分类分页查询参数 */
export interface CategoryPageQuery extends PageQuery {}

/** 商品分类查询参数 */
export interface CategoryQuery {
  /** 关键字(分类名称) */
  keywords?: string;
}

/** 商品分类表单对象 */
export interface CategoryForm {
  /** 主键ID */
  id?: number;
  /** 分类名称 */
  name?: string;
  /** 父级分类ID：用于支持多级分类，NULL表示顶级分类 */
  parentId?: number;
  /** 排序号：数字越小排序越前 */
  sortOrder?: number;
  /** 分类描述 */
  description?: string;
  /** 是否启用：0-禁用, 1-启用 */
  isActive?: number;
  /** 软删除标记：0-未删除, 1-已删除 */
  isDeleted?: number;
}

/** 商品分类分页对象 */
export interface CategoryPageVO {
  /** 主键ID */
  id?: number;
  /** 分类名称 */
  name?: string;
  /** 父级分类ID：用于支持多级分类，NULL表示顶级分类 */
  parentId?: number;
  /** 排序号：数字越小排序越前 */
  sortOrder?: number;
  /** 分类描述 */
  description?: string;
  /** 是否启用：0-禁用, 1-启用 */
  isActive?: number;
  /** 软删除标记：0-未删除, 1-已删除 */
  isDeleted?: number;
  /** 记录创建时间 */
  createTime?: string;
  /** 记录最后更新时间 */
  updateTime?: string;
}

/** 商品分类树形节点对象 */
export interface CategoryVO extends CategoryForm {
  id?: number;
  children?: CategoryVO[];
}
