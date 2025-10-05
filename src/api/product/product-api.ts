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

/** SKU表单对象 */
export interface ProductSkuForm {
  /** SKU ID */
  id?: number;
  /** 商品ID */
  productId?: number;
  /** SKU编码 */
  skuCode?: string;
  /** SKU属性 */
  skuAttributes?: ProductSKUAttribute;
  /** 库存数量 */
  stockQuantity?: number;
  /** 进货价 */
  purchasePrice?: number;
  /** 销售价 */
  salePrice?: number;
  /** 库存预警 */
  minStockAlert?: number;
  /** 是否启用 */
  isActive?: number;
}

/** SKU属性 */
export interface ProductSKUAttribute {
  /** 颜色属性 */
  color?: {
    /** 颜色代码 */
    code?: string;
    /** 颜色名称 */
    name?: string;
  };
  /** 尺寸属性 */
  size?: {
    /** 镜片宽度 */
    lensWidth?: number;
    /** 桥梁宽度 */
    bridgeWidth?: number;
    /** 镜腿长度 */
    templeLength?: number;
    /** 显示信息 */
    display?: string;
  };
  /** 材料属性 */
  material?: string;
  /** 具体属性 */
  specificAttributes?: {
    /** 重量 */
    weight?: number;
    /** 是否有库存 */
    inStock?: boolean;
  };
}

/** 商品属性 */
export interface ProductAttribute {
  /** 产品类型 */
  productType?: string;
  /** 材料类型列表 */
  materialTypes?: string[];
  /** 可用颜色列表 */
  availableColors?: Array<{
    /** 颜色代码 */
    code?: string;
    /** 颜色名称 */
    name?: string;
    /** 颜色图片路径 */
    image?: string;
  }>;
  /** 可用尺寸列表 */
  availableSizes?: Array<{
    /** 镜片宽度 */
    lensWidth?: number;
    /** 桥梁宽度 */
    bridgeWidth?: number;
    /** 镜腿长度 */
    templeLength?: number;
  }>;
  /** 镜框样式 */
  frameStyle?: string;
  /** 镜框形状 */
  frameShape?: string;
  /** 铰链类型 */
  hingeType?: string;
  /** 重量 */
  weight?: number;
  /** 尺寸信息 */
  dimensions?: {
    /** 镜片高度 */
    lensHeight?: number;
    /** 镜片宽度 */
    lensWidth?: number;
    /** 桥梁尺寸 */
    bridge?: number;
    /** 镜腿尺寸 */
    temple?: number;
  };
}

/** 商品信息表单对象 */
export interface ProductForm {
  /** 主键ID */
  id?: number;
  /** 租户ID */
  tenantId?: number;
  /** 商品编码：唯一库存单位编码 */
  productCode?: string;
  /** 商品名称：展示给客户的名称 */
  name?: string;
  /** 品牌ID */
  brandId?: number;
  /** 商品分类ID：关联categories表 */
  categoryId?: number;
  /** 型号：商品具体型号 */
  model?: string;
  /** 商品SKU表单对象 */
  skus?: ProductSkuForm[];
  /** 商品属性 */
  attribute?: ProductAttribute;
  /** 是否上架：0-下架, 1-上架 */
  isActive?: number;
  /** 软删除标记：0-未删除, 1-已删除 */
  isDeleted?: number;
}

/** 商品信息分页对象 */
export interface ProductPageVO {
  /** 主键ID */
  id?: number;
  /** 租户ID */
  tenantId?: number;
  /** 商品编码：唯一库存单位编码 */
  productCode?: string;
  /** 商品名称：展示给客户的名称 */
  name?: string;
  /** 品牌ID */
  brandId?: number;
  /** 品牌名称 */
  brandName?: string;
  /** 商品分类ID：关联categories表 */
  categoryId?: number;
  /** 分类名称 */
  categoryName?: string;
  /** 型号：商品具体型号 */
  model?: string;
  /** 商品SKU表单对象 */
  skus?: ProductSkuForm[];
  /** 商品属性 */
  attribute?: ProductAttribute;
  /** 是否上架：0-下架, 1-上架 */
  isActive?: number;
  /** 软删除标记：0-未删除, 1-已删除 */
  isDeleted?: number;
  /** 记录创建时间 */
  createTime?: Date;
  /** 记录最后更新时间 */
  updateTime?: Date;
}
