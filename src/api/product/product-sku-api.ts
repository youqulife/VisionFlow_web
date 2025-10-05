import request from "@/utils/request";

const PRODUCTSKU_BASE_URL = "/api/v1/product-sku";

const ProductSkuAPI = {
  /** 获取商品SKU分页数据 */
  getPage(queryParams?: ProductSkuPageQuery) {
    return request<any, PageResult<ProductSkuPageVO[]>>({
      url: `${PRODUCTSKU_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取商品SKU表单数据
   *
   * @param id 商品SKUID
   * @returns 商品SKU表单数据
   */
  getFormData(id: number) {
    return request<any, ProductSkuForm>({
      url: `${PRODUCTSKU_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   *  添加商品SKU
   *
   *  @param data 商品SKU表单数据
   */
  create(data: ProductSkuForm) {
    return request({
      url: `${PRODUCTSKU_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新商品SKU
   *
   * @param id 商品SKUID
   * @param data 商品SKU表单数据
   */
  update(id: string, data: ProductSkuForm) {
    return request({
      url: `${PRODUCTSKU_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除商品SKU，多个以英文逗号(,)分割
   *
   * @param ids 商品SKUID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${PRODUCTSKU_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default ProductSkuAPI;

/** 商品SKU分页查询参数 */
export interface ProductSkuPageQuery extends PageQuery {}

/** 商品SKU表单对象 */
export interface ProductSkuForm {
  /** SKU ID */
  id?: number;
  /** 商品ID */
  productId?: number;
  /** SKU编码 */
  skuCode?: string;
  /** SKU属性 */
  skuAttributes?: string;
  /** 库存数量 */
  stockQuantity?: number;
  /** 进货价 */
  purchasePrice?: number;
  /** 销售价 */
  salePrice?: number;
  /** 库存预警 */
  minStockAlert?: number;
  isActive?: number;
}

/** 商品SKU分页对象 */
export interface ProductSkuPageVO {
  /** SKU ID */
  id?: number;
  /** 租户ID */
  tenantId?: number;
  /** 商品ID */
  productId?: number;
  /** SKU编码 */
  skuCode?: string;
  /** SKU属性 */
  skuAttributes?: string;
  /** 库存数量 */
  stockQuantity?: number;
  /** 进货价 */
  purchasePrice?: number;
  /** 销售价 */
  salePrice?: number;
  /** 库存预警 */
  minStockAlert?: number;
  isActive?: number;
  isDeleted?: number;
  createTime?: Date;
  updateTime?: Date;
}
