package org.example.sellsight.bigdata.mapreduce;

import org.apache.hadoop.io.Writable;

import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;

public class TrendMetricsWritable implements Writable {

    private long viewsCount;
    private long clicksCount;
    private long addToCartCount;
    private long purchaseCount;
    private double revenue30d;

    public TrendMetricsWritable() {}

    public TrendMetricsWritable(long viewsCount, long clicksCount, long addToCartCount, long purchaseCount, double revenue30d) {
        this.viewsCount = viewsCount;
        this.clicksCount = clicksCount;
        this.addToCartCount = addToCartCount;
        this.purchaseCount = purchaseCount;
        this.revenue30d = revenue30d;
    }

    public void add(TrendMetricsWritable other) {
        this.viewsCount += other.viewsCount;
        this.clicksCount += other.clicksCount;
        this.addToCartCount += other.addToCartCount;
        this.purchaseCount += other.purchaseCount;
        this.revenue30d += other.revenue30d;
    }

    public double score() {
        return (viewsCount * 1.0)
                + (clicksCount * 2.0)
                + (addToCartCount * 3.0)
                + (purchaseCount * 5.0)
                + (revenue30d * 0.01);
    }

    public long getViewsCount() { return viewsCount; }
    public long getClicksCount() { return clicksCount; }
    public long getAddToCartCount() { return addToCartCount; }
    public long getPurchaseCount() { return purchaseCount; }
    public double getRevenue30d() { return revenue30d; }

    @Override
    public void write(DataOutput out) throws IOException {
        out.writeLong(viewsCount);
        out.writeLong(clicksCount);
        out.writeLong(addToCartCount);
        out.writeLong(purchaseCount);
        out.writeDouble(revenue30d);
    }

    @Override
    public void readFields(DataInput in) throws IOException {
        viewsCount = in.readLong();
        clicksCount = in.readLong();
        addToCartCount = in.readLong();
        purchaseCount = in.readLong();
        revenue30d = in.readDouble();
    }
}
