package org.example.sellsight.order.application.usecase;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.order.application.dto.PaymentIntentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class CreatePaymentIntentUseCase {
    @Value("${STRIPE_SECRET_KEY}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public PaymentIntentResponse execute(long amount) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency("usd")
                .addPaymentMethodType("card")
                .build();
            PaymentIntent intent = PaymentIntent.create(params);
            return new PaymentIntentResponse(intent.getClientSecret());
        }catch (StripeException e) {
            log.error("Stripe Error: {}", e.getMessage());
            if (e.getStripeError() != null) {
                log.error("Code: {}", e.getStripeError().getCode());
            }
            throw new RuntimeException("Failed to create Stripe payment intent: " + e.getMessage(), e);
        }
    }
}
