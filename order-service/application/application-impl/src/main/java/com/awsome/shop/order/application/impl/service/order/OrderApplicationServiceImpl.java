package com.awsome.shop.order.application.impl.service.order;

import com.awsome.shop.order.application.api.dto.order.OrderDTO;
import com.awsome.shop.order.application.api.dto.order.request.*;
import com.awsome.shop.order.application.api.service.order.OrderApplicationService;
import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.common.enums.OrderErrorCode;
import com.awsome.shop.order.common.exception.BusinessException;
import com.awsome.shop.order.domain.model.order.OrderEntity;
import com.awsome.shop.order.domain.model.order.OrderStatus;
import com.awsome.shop.order.domain.service.order.OrderDomainService;
import com.awsome.shop.order.application.impl.remote.PointsServiceClient;
import com.awsome.shop.order.application.impl.remote.ProductServiceClient;
import com.awsome.shop.order.application.impl.remote.ProductServiceClient.ProductInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * 订单应用服务实现
 *
 * <p>Order Service 是兑换事务的 Saga 协调者</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderApplicationServiceImpl implements OrderApplicationService {

    private final OrderDomainService orderDomainService;
    private final ProductServiceClient productServiceClient;
    private final PointsServiceClient pointsServiceClient;

    @Override
    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request, Long employeeId) {
        // 1. 调用 Product Service 获取商品信息
        ProductInfo product = productServiceClient.getProduct(request.getProductId());

        // 2. 计算总积分
        BigDecimal totalPoints = BigDecimal.valueOf(product.getPointsPrice()).multiply(BigDecimal.valueOf(request.getQuantity()));

        // 生成临时订单号用于关联积分扣减记录
        String tempOrderNo = "ORD-TEMP-" + System.currentTimeMillis();

        // 3. 调用 Points Service 扣减积分
        pointsServiceClient.deductPoints(employeeId, totalPoints, tempOrderNo);

        // 4. 调用 Product Service 扣减库存
        try {
            productServiceClient.deductStock(request.getProductId(), request.getQuantity());
        } catch (Exception e) {
            // 5. 库存扣减失败 → 退还积分（Saga 补偿）
            log.warn("库存扣减失败，执行积分退还补偿: employeeId={}, points={}", employeeId, totalPoints);
            pointsServiceClient.refundPoints(employeeId, totalPoints, tempOrderNo);
            throw e;
        }

        // 6. 创建订单记录
        OrderEntity entity = orderDomainService.createOrder(
                employeeId,
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                BigDecimal.valueOf(product.getPointsPrice()),
                request.getQuantity(),
                totalPoints
        );

        return toDTO(entity);
    }

    @Override
    @Transactional
    public void cancelOrder(CancelOrderRequest request, Long employeeId) {
        OrderEntity order = orderDomainService.getById(request.getOrderId());

        // 校验是否是本人订单
        if (!order.getEmployeeId().equals(employeeId)) {
            throw new BusinessException(OrderErrorCode.ORDER_NOT_OWNED);
        }

        // 执行取消
        orderDomainService.cancelOrder(request.getOrderId(), request.getReason());

        // 补偿: 退还积分 + 恢复库存
        pointsServiceClient.refundPoints(order.getEmployeeId(), order.getTotalPoints(), order.getOrderNo());
        productServiceClient.restoreStock(order.getProductId(), order.getQuantity());
    }

    @Override
    public PageResult<OrderDTO> listOrders(ListOrdersRequest request) {
        OrderStatus status = null;
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            status = OrderStatus.valueOf(request.getStatus());
        }
        PageResult<OrderEntity> page = orderDomainService.page(
                request.getPageNum(), request.getPageSize(),
                request.getEmployeeId(), status);
        return page.convert(this::toDTO);
    }

    @Override
    public OrderDTO getOrder(Long orderId) {
        return toDTO(orderDomainService.getById(orderId));
    }

    @Override
    @Transactional
    public void shipOrder(Long orderId) {
        orderDomainService.shipOrder(orderId);
    }

    @Override
    @Transactional
    public void completeOrder(Long orderId) {
        orderDomainService.completeOrder(orderId);
    }

    private OrderDTO toDTO(OrderEntity entity) {
        OrderDTO dto = new OrderDTO();
        dto.setId(entity.getId());
        dto.setOrderNo(entity.getOrderNo());
        dto.setEmployeeId(entity.getEmployeeId());
        dto.setProductId(entity.getProductId());
        dto.setProductName(entity.getProductName());
        dto.setProductImage(entity.getProductImage());
        dto.setPointsCost(entity.getPointsCost());
        dto.setQuantity(entity.getQuantity());
        dto.setTotalPoints(entity.getTotalPoints());
        dto.setStatus(entity.getStatus().name());
        dto.setStatusDesc(entity.getStatus().getDescription());
        dto.setRemark(entity.getRemark());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
