import { Link, useNavigate } from "react-router-dom";

export default function Nav({ open }) {
  const navigate = useNavigate();
  let json;

  const handleDashboard = async () => {
    try {
      console.log(localStorage.authToken);
      const response = await fetch("http://localhost:3001/dashboard/dashboard", {
        method: "POST",
        body: JSON.stringify({ Token: localStorage.authToken }),
        mode: "cors",
        headers: {
          "Content-type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      json = await response.json();
      console.log("response we get");
      console.log(json);
      navigate("/dashboard", { state: { id: json.id } });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      alert("Failed to connect to server. Please make sure the backend is running on http://localhost:3001");
    }
  };

  const handlelogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
    console.log("loggedout");
  };

  return (
    <div className="fixed w-screen z-30">
      <div>
        <ul className="flex justify-between bg-[#131722] h-[70px] text-white w-[100%] p-5">
          <div>
            <li className="text-[15px] sm:text-[18px] md:text-2xl font-bold  text-white  ">
              <Link to="/">CryptoFolio</Link>
            </li>
          </div>
          <div className="text-[20px] font-bold  text-white ">
            {!localStorage.getItem("authToken") ? (
              <div className=" flex">
                <li className="mx-2 text-[15px] sm:text-[18px] md:text-xl">
                  <button
                    onClick={() => {
                      open[1](true); // opensign = Signup component (Sign In form)
                    }}
                  >
                    SignIn
                  </button>
                </li>
                <li className="mx-2 text-[15px] sm:text-[18px] md:text-xl">
                  <button
                    onClick={() => {
                      open[0](true); // open = LoginModal component (Sign Up form)
                    }}
                  >
                    SignUp
                  </button>
                </li>
              </div>
            ) : (
              <div className=" flex text-[15px] sm:text-[18px] md:text-xl">
                <li className="mx-2">
                  <button onClick={handleDashboard}>Dashboard</button>
                </li>
                <li className="mx-2">
                  <button onClick={handlelogout}>SignOut</button>
                </li>
              </div>
            )}
          </div>
        </ul>
      </div>
      {/* {open && <LoginModal closemod={Open}/>} */}
    </div>
  );
}
