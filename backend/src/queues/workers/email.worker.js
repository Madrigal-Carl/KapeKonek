import { Worker } from "bullmq";
import { valkeyConnection } from "../../config/valkey.js";
import { sendEmail } from "../../services/email.service.js";
import { EMAIL_JOBS } from "../email.jobs.js";
import { accountApprovedTemplate } from "../../templates/email/account-approved.template.js";
import { associationApprovedTemplate } from "../../templates/email/association-approved.template.js";
import { verifyEmailTemplate } from "../../templates/email/verify-email.template.js";

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { type, data } = job.data;

    const handlers = {
      [EMAIL_JOBS.VERIFY_EMAIL]: async () => {
        return sendEmail({
          to: data.to,
          subject: "Verify Your Email",
          html: verifyEmailTemplate({ verifyUrl: data.verifyUrl }),
        });
      },
      [EMAIL_JOBS.ACCOUNT_APPROVED]: async () => {
        return sendEmail({
          to: data.to,
          subject: "Your KapeKonek Registration Has Been Verified",
          html: accountApprovedTemplate({ name: data.name }),
        });
      },
      [EMAIL_JOBS.ASSOCIATION_APPROVED]: async () => {
        return sendEmail({
          to: data.to,
          subject: "Your Association Application Has Been Approved",
          html: associationApprovedTemplate({
            name: data.name,
            association: data.association,
          }),
        });
      },
    };

    const handler = handlers[type];

    if (!handler) {
      throw new Error(`Unknown email job type: ${type}`);
    }

    return handler();
  },
  {
    connection: valkeyConnection,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Email job completed: ${job.id}`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Email job failed: ${job?.id}`, err);
});

export default emailWorker;