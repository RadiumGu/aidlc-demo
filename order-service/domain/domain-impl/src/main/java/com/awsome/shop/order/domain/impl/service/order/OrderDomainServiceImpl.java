package com.awsome.shop.order.domain.impl.service.order;

import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.common.enums.OrderErrorCode;
import com.awsome.shop.order.common.exception.BusinessException;
import com.awsome.shop.order.domain.model.order.OrderEntity;
import com.awsome.shop.order.domain.model.order.OrderStatus;
import com.awsome.shop.order.domain.service.order.OrderDomainService;
import com.awsome.shop.order.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * 订单领域服务实现
 */
@Service
@RequiredArgsConstructor
public class OrderDomainServiceImpl implements OrderDomainService {

    private final OrderRepository orderRepository;
    private final Random random = new Random();

    @Override
    public OrderEntity createOrder(Long employeeId, Long productId, String productName,
                                   String productImage, BigDecimal pointsCost, Integer quantity,
                                   BigDecimal totalPoints) {
        OrderEntity entity = new OrderEntity();
        entity.setOrderNo(generateOrderNo());
        entity.setEmployeeId(employeeId);
        entity.setProductId(productId);
        entity.setProductName(productName);
        entity.setProductImage(productImage);
        entity.setPointsCost(pointsCost);
        entity.setQuantity(quantity);
        entity.setTotalPoints(totalPoints);
        entity.setStatus(OrderStatus.PENDING);
        orderRepository.save(entity);
        return orderRepository.getById(entity.getId());
    }

    @Override
    public void cancelOrder(Long orderId, String reason) {
        OrderEntity entity = getById(orderId);
        if (entity.getStatus() == OrderStatus.COMPLETED || entity.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException(OrderErrorCode.ORDER_CANCEL_NOT_ALLOWED);
        }
        entity.setStatus(OrderStatus.CANCELLED);
        entity.setRemark(reason);
        orderRepository.update(entity);
    }

    @Override
    public void shipOrder(Long orderId) {
        OrderEntity entity = getById(orderId);
        if (entity.getStatus() != OrderStatus.PENDING && entity.getStatus() != OrderStatus.TO_SHIP) {
            throw new BusinessException(OrderErrorCode.ORDER_STATUS_INVALID,
                    "只有待处理/待发货的订单可以发货");
        }
        entity.setStatus(OrderStatus.SHIPPED);
        orderRepository.update(entity);
    }

    @Override
    public void completeOrder(Long orderId) {
        OrderEntity entity = getById(orderId);
        if (entity.getStatus() != OrderStatus.SHIPPED) {
            throw new BusinessException(OrderErrorCode.ORDER_STATUS_INVALID,
                    "只有已发货的订单可以确认完成");
        }
        entity.setStatus(OrderStatus.COMPLETED);
        orderRepository.update(entity);
    }

    @Override
    public OrderEntity getById(Long id) {
        OrderEntity entity = orderRepository.getById(id);
        if (entity == null) {
            throw new BusinessException(OrderErrorCode.ORDER_NOT_FOUND);
        }
        return entity;
    }

    @Override
    public PageResult<OrderEntity> page(int page, int size, Long employeeId, OrderStatus status) {
        return orderRepository.page(page, size, employeeId, status);
    }

    /**
     * 生成订单号: ORD + yyyyMMddHHmmss + 4位随机数
     */
    private String generateOrderNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int rand = random.nextInt(10000);
        return String.format("ORD%s%04d", timestamp, rand);
    }
}
