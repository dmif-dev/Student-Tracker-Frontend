import Link from "next/link";
import { User, ShieldAlert, GraduationCap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full px-4 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Welcome to Student Tracker
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            Select your role to access your personalized dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Student Role */}
          <Link href="/Student/dashboard" className="group block">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:border-primary hover:-translate-y-2">
              <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <GraduationCap size={40} className="group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Student</h2>
              <p className="text-gray-500 leading-relaxed">
                Access your courses, track your progress, and view resources for a superior learning experience.
              </p>
            </div>
          </Link>

          {/* Mentor Role */}
          <Link href="/mentor" className="group block">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:border-primary hover:-translate-y-2">
              <div className="h-20 w-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <User size={40} className="group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Mentor</h2>
              <p className="text-gray-500 leading-relaxed">
                Connect with mentees, schedule and manage sessions, and guide students to success.
              </p>
            </div>
          </Link>

          {/* Admin Role */}
          <Link href="/admin" className="group block">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:border-primary hover:-translate-y-2">
              <div className="h-20 w-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <ShieldAlert size={40} className="group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Admin</h2>
              <p className="text-gray-500 leading-relaxed">
                Oversee operations, handle system administration, view comprehensive reports, and manage users.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
