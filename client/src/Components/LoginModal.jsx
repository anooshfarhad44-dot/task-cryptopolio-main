import React from "react";
import { useState } from "react";

export default function LoginModal({ closemod }) {
  const [credentials, setcredentials] = useState({
    first_name: "",
    last_name: "",
    age: "",
    mob: "",
    email: "",
    password: "",
  });
  const onchange = (e) => {
    setcredentials({ ...credentials, [e.target.name]: e.target.value });
  };
  const [loggedin, setloggedin] = useState(false);

  const eventHandler = async () => {
    try {
      // Validate fields
      if (!credentials.first_name || !credentials.last_name || !credentials.email || !credentials.password) {
        alert("Please fill in all required fields");
        return;
      }
      
      if (credentials.password.length < 5) {
        alert("Password must be at least 5 characters long");
        return;
      }

      console.log("Sending signup request...");
      const response = await fetch("http://localhost:3001/register/creatuser", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          first_name: credentials.first_name,
          last_name: credentials.last_name,
          age: credentials.age,
          mob: credentials.mob,
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        console.error("Response not OK:", response.status, response.statusText);
        alert(`Server error: ${response.status} ${response.statusText}`);
        return;
      }

      const json = await response.json();
      console.log("Server response:", json);

      if (json.userexist) {
        alert("User already exists. Please login instead.");
      } 
      else {
        if (!json.success) {
          alert("Signup failed. Please check your credentials.");
        } else {
          localStorage.setItem("authToken", json.authToken);
          console.log("Signup successful!");
          setloggedin(true);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Network error. Please check your connection and try again.");
    }
  };

  //--------------------------create wallet----------------//

  //--------------------------create wallet----------------//

  if (loggedin) {
    closemod[0](false);
  } else {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
        {/* Backdrop with blur */}
        <div 
          className="absolute inset-0 bg-[#131722] bg-opacity-90 backdrop-blur-sm"
          onClick={() => closemod[0](false)}
        ></div>
        
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 grad_bg rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 grad_bg rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        {/* Modal Card */}
        <div className="relative w-[90%] max-w-2xl bg-gradient-to-br from-[#1d2230] to-[#272e41] rounded-2xl shadow-2xl border border-[#3a4155] overflow-hidden transform transition-all duration-300 hover:scale-[1.01] my-8">
          {/* Close Button */}
          <button
            onClick={() => closemod[0](false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="p-8 pb-6">
            <div className="text-center mb-2">
              <h1 className="text-3xl font-bold text-white mb-2">
                Join CryptoFolio
              </h1>
              <p className="text-gray-400 text-sm">
                Create your account and start trading today
              </p>
            </div>
          </div>

          {/* Form */}
          <form className="px-8 pb-8" onSubmit={(e) => { e.preventDefault(); eventHandler(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={credentials.first_name}
                  onChange={onchange}
                  className="w-full px-4 py-3 bg-[#171b26] border border-[#3a4155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#209fe4] focus:border-transparent transition-all duration-200"
                  placeholder="John"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={credentials.last_name}
                  onChange={onchange}
                  className="w-full px-4 py-3 bg-[#171b26] border border-[#3a4155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#209fe4] focus:border-transparent transition-all duration-200"
                  placeholder="Doe"
                  required
                />
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={credentials.age}
                  onChange={onchange}
                  className="w-full px-4 py-3 bg-[#171b26] border border-[#3a4155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#209fe4] focus:border-transparent transition-all duration-200"
                  placeholder="25"
                  min="18"
                />
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="mob" className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mob"
                  name="mob"
                  value={credentials.mob}
                  onChange={onchange}
                  className="w-full px-4 py-3 bg-[#171b26] border border-[#3a4155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#209fe4] focus:border-transparent transition-all duration-200"
                  placeholder="+91 1234567890"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={onchange}
                    className="w-full pl-10 pr-4 py-3 bg-[#171b26] border border-[#3a4155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#209fe4] focus:border-transparent transition-all duration-200"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password * (min. 5 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={onchange}
                    className="w-full pl-10 pr-4 py-3 bg-[#171b26] border border-[#3a4155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#209fe4] focus:border-transparent transition-all duration-200"
                    placeholder="Enter a strong password"
                    required
                    minLength="5"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={eventHandler}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-[#5659f3] to-[#0ea7df] text-white font-semibold rounded-lg hover:from-[#4a4dd8] hover:to-[#0d95c8] focus:outline-none focus:ring-2 focus:ring-[#209fe4] focus:ring-offset-2 focus:ring-offset-[#1d2230] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Create Account
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => {
                  closemod[1](true);
                  closemod[0](false);
                }}
                className="text-[#209fe4] hover:text-[#0ea7df] font-semibold transition-colors duration-200 underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
