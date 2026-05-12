import SessionReminderButton from "@/components/common/SessionReminderButton";
import EmailSender from "@/components/common/EmailSender";

export default function TestEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col md:flex-row items-center justify-center gap-8">
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Option A: Direct Dispatch</h3>
        <EmailSender />
      </div>

      <div className="flex flex-col items-center">
        <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Option B: Session Reminder</h3>
        <SessionReminderButton />
      </div>
    </div>
  );
}
