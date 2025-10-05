import request from "@/utils/request";

const PRODUCT_BASE_URL = "/api/v1/product";

const ProductAPI = {
  /** 获取商品信息分页数据 */
  getPage(queryParams?: ProductPageQuery) {
    return request<any, PageResult<ProductPageVO[]>>({
      url: `${PRODUCT_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取商品信息表单数据
   *
   * @param id 商品信息ID
   * @returns 商品信息表单数据
   */
  getFormData(id: number) {
    return request<any, ProductForm>({
      url: `${PRODUCT_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   *  添加商品信息
   *
   *  @param data 商品信息表单数据
   */
  create(data: ProductForm) {
    return request({
      url: `${PRODUCT_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新商品信息
   *
   * @param id 商品信息ID
   * @param data 商品信息表单数据
   */
  update(id: string, data: ProductForm) {
    return request({
      url: `${PRODUCT_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除商品信息，多个以英文逗号(,)分割
   *
   * @param ids 商品信息ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${PRODUCT_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default ProductAPI;

/** 商品信息分页查询参数 */
export interface ProductPageQuery extends PageQuery {}

/** 商品信息表单对象 */
export interface ProductForm {
  /** 主键ID */
  id?: number;
  /** 商品SKU编码：唯一库存单位编码 */
  sku?: string;
  /** 商品名称：展示给客户的名称 */
  name?: string;
  /** 商品分类ID：关联categories表 */
  categoryId?: number;
  /** 品牌名称：如"依视路", "蔡司", "雷朋"等 */
  brandId?: number;
  /** 型号：商品具体型号 */
  model?: string;
  /** 折射率：如1.56, 1.60, 1.67, 1.74等 */
  refractiveIndex?: number;
  /** 镜片功能：如"防蓝光", "变色", "渐进多焦点"等 */
  lensFunction?: string;
  /** 进货价格 */
  purchasePrice?: number;
  /** 销售价格 */
  salePrice?: number;
  /** 库存数量 */
  stockQuantity?: number;
  /** 最低库存预警线 */
  minStockAlert?: number;
  /** 是否上架：0-下架, 1-上架 */
  isActive?: number;
}

/** 商品信息分页对象 */
export interface ProductPageVO {
  /** 主键ID */
  id?: number;
  /** 商品SKU编码：唯一库存单位编码 */
  sku?: string;
  /** 商品名称：展示给客户的名称 */
  name?: string;
  /** 商品分类ID：关联categories表 */
  categoryId?: number;
  categoryName?: string;
  /** 品牌名称：如"依视路", "蔡司", "雷朋"等 */
  brandId?: string;
  brandName?: string;
  /** 型号：商品具体型号 */
  model?: string;
  /** 折射率：如1.56, 1.60, 1.67, 1.74等 */
  refractiveIndex?: number;
  /** 镜片功能：如"防蓝光", "变色", "渐进多焦点"等 */
  lensFunction?: string;
  /** 进货价格 */
  purchasePrice?: number;
  /** 销售价格 */
  salePrice?: number;
  /** 库存数量 */
  stockQuantity?: number;
  /** 最低库存预警线 */
  minStockAlert?: number;
  /** 是否上架：0-下架, 1-上架 */
  isActive?: number;
  /** 软删除标记：0-未删除, 1-已删除 */
  isDeleted?: number;
  /** 记录创建时间 */
  createTime?: Date;
  /** 记录最后更新时间 */
  updateTime?: Date;
}
