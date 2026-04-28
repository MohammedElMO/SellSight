package org.example.sellsight.bigdata.mapreduce;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

import java.io.IOException;

public class TrendScoreMapper extends Mapper<LongWritable, Text, Text, TrendMetricsWritable> {

    @Override
    protected void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
        String line = value.toString().trim();
        if (line.isEmpty()) {
            return;
        }

        String[] fields = line.split("\t");
        if (fields.length < 8) {
            context.getCounter("TREND_SCORE", "INVALID_ROWS").increment(1);
            return;
        }

        try {
            String productId = fields[0];
            long views = parseLong(fields[3]);
            long clicks = parseLong(fields[4]);
            long addToCart = parseLong(fields[5]);
            long purchases = parseLong(fields[6]);
            double revenue = parseDouble(fields[7]);

            context.write(new Text(productId), new TrendMetricsWritable(views, clicks, addToCart, purchases, revenue));
        } catch (Exception ex) {
            context.getCounter("TREND_SCORE", "PARSE_ERRORS").increment(1);
        }
    }

    private long parseLong(String value) {
        if (value == null || value.isBlank() || "\\N".equals(value)) {
            return 0L;
        }
        return Long.parseLong(value.trim());
    }

    private double parseDouble(String value) {
        if (value == null || value.isBlank() || "\\N".equals(value)) {
            return 0.0d;
        }
        return Double.parseDouble(value.trim());
    }
}
