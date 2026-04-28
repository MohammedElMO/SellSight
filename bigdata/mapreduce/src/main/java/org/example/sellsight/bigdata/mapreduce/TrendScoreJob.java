package org.example.sellsight.bigdata.mapreduce;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public final class TrendScoreJob {

    private TrendScoreJob() {}

    public static void main(String[] args) throws Exception {
        if (args.length < 2) {
            System.err.println("Usage: TrendScoreJob <input> <output>");
            System.exit(1);
        }

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "sellsight-trend-score");
        job.setJarByClass(TrendScoreJob.class);

        job.setMapperClass(TrendScoreMapper.class);
        job.setReducerClass(TrendScoreReducer.class);

        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(TrendMetricsWritable.class);
        job.setOutputKeyClass(NullWritable.class);
        job.setOutputValueClass(Text.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 2);
    }
}
