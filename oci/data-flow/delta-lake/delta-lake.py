import sys
from delta.tables import DeltaTable
from pyspark.sql import SparkSession
from pyspark.sql.functions import *


def main():
    spark = SparkSession.builder.appName("delta-lake-sample").getOrCreate()
    spark.sparkContext.setLogLevel(logLevel="INFO")

    deltaTablePath = sys.argv[1]  # URL of object storage(oci://~)

    print(">>> create table with id in range(0, 5)")
    spark.range(0, 5).withColumn("data", lit("create")) \
        .write.format("delta").mode("overwrite").save(deltaTablePath)
    spark.read.format("delta").load(deltaTablePath).show()

    print(">>> append rows with id range(5, 10)")
    spark.range(5, 10).withColumn("data", lit("append")) \
        .write.format("delta").mode("append").save(deltaTablePath)
    spark.read.format("delta").load(deltaTablePath).show()

    deltaTable = DeltaTable.forPath(spark, deltaTablePath)

    print(">>> update rows where id is even")
    deltaTable.update(condition=expr("id % 2 == 0"),
                      set={"data": lit("update")})
    deltaTable.toDF().show()


if __name__ == "__main__":
    main()
