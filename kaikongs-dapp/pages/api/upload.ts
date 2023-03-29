import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import { promises as fs } from "fs";
import AWS from "aws-sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data: any = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, function (err, fields, files) {
        if (err) reject({ err });
        resolve({ fields, files });
      });
    });
    const { address } = data?.fields;
    const contents = await fs.readFile(data?.files?.file.filepath);

    const mimetype = data?.files?.file.mimetype;
    await fs.writeFile(`F://${address}.${mimetype.split("/")[1]}`, contents);

    if (contents) {
      const s3 = new AWS.S3({
        apiVersion: "2006-03-01",
        accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID,
        secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY,
        endpoint: "https://s3.filebase.com",
        region: "us-east-1",
        s3ForcePathStyle: true,
      });

      console.log(process.env.FILEBASE_PROFILE_BUCKET_NAME);
      const params = {
        Bucket: process.env.FILEBASE_PROFILE_BUCKET_NAME,
        Key: `profile/${address}`,
        ContentType: mimetype,
        Body: contents,
        ACL: "public-read",
      };

      //   const corsParams = {
      //     Bucket: process.env.FILEBASE_PROFILE_BUCKET_NAME,
      //     CORSConfiguration: {
      //         "CORSRules":[
      //             {
      //                 "AllowedHeaders": [],
      //                 "AllowedMethods": [
      //                     "GET"
      //                 ],
      //                 "AllowedOrigins": [
      //                     "*"
      //                 ],
      //                 "ExposeHeaders": []
      //             }
      //             ]
      //         }
      //   }
      //   const request = s3.putBucketCors(corsParams)
      const request = s3.putObject(params);
      const url = s3.getSignedUrl("putObject", params);
      try {
        await new Promise((resolve, reject) => {
          request.send((err, data) => {
            console.log(err);
            if (err) return reject(err);
            resolve(data);
          });
        });

        res.status(200).json({ success: true, url: url.split("?")[0] });
      } catch (err) {
        res.status(401).json({ success: false, error: err });
      }
    } else {
      res.status(400).json({ success: false, error: "Empty file content" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
