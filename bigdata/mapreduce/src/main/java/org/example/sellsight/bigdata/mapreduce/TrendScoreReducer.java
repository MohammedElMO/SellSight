package org.example.sellsight.bigdata.mapreduce;

import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

import java.io.IOException;
import java.time.LocalDateTime;

public class TrendScoreReducer extends Reducer<Text, TrendMetricsWritable, NullWritable, Text> {

    @Override
    protected void reduce(Text key, Iterable<TrendMetricsWritable> values, Context context) throws IOException, InterruptedException {
        TrendMetricsWritable total = new TrendMetricsWritable();
        for (TrendMetricsWritable value : values) {
            TrendMetricsWritable copy = new TrendMetricsWritable(
                    value.getViewsCount(),
                    value.getClicksCount(),
                    value.getAddToCartCount(),
                    value.getPurchaseCount(),
                    value.getRevenue30d()
            );
            total.add(copy);
        }

        String computedAt = LocalDateTime.now().toString();
        String output = String.join("\t",
                key.toString(),
                String.valueOf(total.getViewsCount()),
                String.valueOf(total.getClicksCount()),
                String.valueOf(total.getAddToCartCount()),
                String.valueOf(total.getPurchaseCount()),
                String.valueOf(total.getRevenue30d()),
                String.valueOf(total.score()),
                computedAt
        );

        context.write(NullWritable.get(), new Text(output));
    }
}
