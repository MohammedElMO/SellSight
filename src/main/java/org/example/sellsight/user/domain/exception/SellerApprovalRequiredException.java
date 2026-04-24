package org.example.sellsight.user.domain.exception;

import org.example.sellsight.user.domain.model.SellerStatus;

public class SellerApprovalRequiredException extends RuntimeException {

    private final String errorCode;

    public SellerApprovalRequiredException(SellerStatus status) {
        super(status == SellerStatus.PENDING
                ? "Your seller account is pending admin approval. You will be notified once approved."
                : "Your seller application has been rejected. Please contact support for details.");
        this.errorCode = status == SellerStatus.PENDING ? "SELLER_PENDING_APPROVAL" : "SELLER_REJECTED";
    }

    public String getErrorCode() {
        return errorCode;
    }
}
