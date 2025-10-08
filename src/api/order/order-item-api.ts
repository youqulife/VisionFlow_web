import request from "@/utils/request";
import { ProductSkuForm } from "@/api/product/product-api";

const ORDERITEM_BASE_URL = "/api/v1/order-item";

const OrderItemAPI = {
  /** 获取订单明细分页数据 */
  getPage(queryParams?: OrderItemPageQuery) {
    return request<any, PageResult<OrderItemPageVO[]>>({
      url: `${ORDERITEM_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取订单明细表单数据
   *
   * @param id 订单明细ID
   * @returns 订单明细表单数据
   */
  getFormData(id: number) {
    return request<any, OrderItemForm>({
      url: `${ORDERITEM_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   *  添加订单明细
   *
   *  @param data 订单明细表单数据
   */
  create(data: OrderItemForm) {
    return request({
      url: `${ORDERITEM_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新订单明细
   *
   * @param id 订单明细ID
   * @param data 订单明细表单数据
   */
  update(id: string, data: OrderItemForm) {
    return request({
      url: `${ORDERITEM_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除订单明细，多个以英文逗号(,)分割
   *
   * @param ids 订单明细ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${ORDERITEM_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default OrderItemAPI;

/** 订单明细分页查询参数 */
export interface OrderItemPageQuery extends PageQuery {}

/** 订单明细表单对象 */
export interface OrderItemForm {
  /** 订单明细ID */
  id?: number;
  /** 商品ID */
  productId?: number;
  /** 商品名称 */
  productName?: string;
  /** SKU编码 */
  skuCode?: string;
  /** 数量 */
  quantity?: number;
  /** 单价 */
  unitPrice?: number;
  /** 小计 */
  subtotal?: number;
  /** 折扣率 */
  discountRate?: number;
  /** 折扣金额 */
  discountAmount?: number;
  /** 商品金额 */
  itemTotal?: number;
  /** 可用SKU列表（仅前端使用） */
  availableSkus?: ProductSkuForm[];
}

/** 订单明细分页对象 */
export interface OrderItemPageVO {
  /** 订单明细ID */
  id?: number;
  /** 商品ID */
  productId?: number;
  /** 商品名称 */
  productName?: string;
  /** SKU编码 */
  skuCode?: string;
  /** 数量 */
  quantity?: number;
  /** 单价 */
  unitPrice?: number;
  /** 小计 */
  subTotal?: number;
  /** 折扣率 */
  discountRate?: number;
  /** 折扣金额 */
  discountAmount?: number;
  /** 商品金额 */
  itemTotal?: number;
}
