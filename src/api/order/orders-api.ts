import request from "@/utils/request";
import { OrderItemForm, OrderItemPageVO } from "@/api/order/order-item-api";

const ORDERS_BASE_URL = "/api/v1/orders";

const OrdersAPI = {
  /** 获取订单分页数据 */
  getPage(queryParams?: OrdersPageQuery) {
    return request<any, PageResult<OrdersPageVO[]>>({
      url: `${ORDERS_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取订单表单数据
   *
   * @param id 订单ID
   * @returns 订单表单数据
   */
  getFormData(id: number) {
    return request<any, OrdersForm>({
      url: `${ORDERS_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   *  添加订单
   *
   *  @param data 订单表单数据
   */
  create(data: OrdersForm) {
    return request({
      url: `${ORDERS_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新订单
   *
   * @param id 订单ID
   * @param data 订单表单数据
   */
  update(id: string, data: OrdersForm) {
    return request({
      url: `${ORDERS_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除订单，多个以英文逗号(,)分割
   *
   * @param ids 订单ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${ORDERS_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default OrdersAPI;

/** 订单分页查询参数 */
export interface OrdersPageQuery extends PageQuery {}

/** 订单表单对象 */
export interface OrdersForm {
  /** 订单ID */
  id?: number;
  /** 顾客ID */
  customerId?: number;
  /** 关联的验光记录ID */
  eyeExamId?: number;
  /** 订单号 */
  orderNumber?: string;
  orderType?: string;
  /** 订单小计 */
  subtotal?: number;
  /** 优惠金额 */
  discountAmount?: number;
  /** 订单金额 */
  totalAmount?: number;
  /** 实付金额 */
  actualAmount?: number;
  status?: string;
  /** 支付方式 */
  paymentMethod?: string;
  /** 处方数据快照 */
  prescriptionData?: string;
  /** 订单备注 */
  notes?: string;
  /** 订单明细列表 */
  items?: OrderItemForm[];
}

/** 订单分页对象 */
export interface OrdersPageVO {
  /** 订单ID */
  id?: number;
  /** 租户ID */
  tenantId?: number;
  /** 顾客ID */
  customerId?: number;
  /** 关联的验光记录ID */
  eyeExamId?: number;
  /** 订单号 */
  orderNumber?: string;
  orderType?: string;
  /** 订单总金额 */
  totalAmount?: number;
  /** 优惠金额 */
  discountAmount?: number;
  /** 订单金额 */
  orderAmount?: number;
  /** 实付金额 */
  actualAmount?: number;
  status?: string;
  /** 支付方式 */
  paymentMethod?: string;
  /** 处方数据快照 */
  prescriptionData?: string;
  /** 订单备注 */
  notes?: string;
  isDeleted?: number;
  createTime?: Date;
  updateTime?: Date;

  // 订单明细列表
  items?: OrderItemPageVO[];
}
