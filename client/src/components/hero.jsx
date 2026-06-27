import {
  ArrowRight,
  Play,
  Tractor,
  ShieldCheck,
  Users,
  Star,
  Sprout,
  Handshake,
  Leaf,
  Wheat
} from "lucide-react";
import { motion } from "framer-motion";
import mascot from "../assets/mascot.png";

function Nav() {
  const links = [
    "Home",
    "Browse Equipment",
    "How It Works",
    "About Us",
    "Contact"
  ];

  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-6">

      <div className="flex items-center gap-2">

        <img
          src={mascot}
          className="h-12"
        />

        <div>

          <h1 className="text-3xl font-black">

            <span className="text-green-900">

              Kisan

            </span>

            <span className="text-green-600">

              Setu

            </span>

          </h1>

          <p className="text-xs uppercase tracking-widest text-gray-500">

            Connect • Share • Grow

          </p>

        </div>

      </div>


      <ul className="hidden lg:flex gap-8">

        {links.map((item, i) => (

          <li key={item}>

            <a
              className={`font-semibold ${
                i === 0
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >

              {item}

            </a>

          </li>

        ))}

      </ul>


      <div className="flex gap-3">

        <button
          className="px-6 py-3 rounded-full border border-green-600 text-green-800"
        >

          Login

        </button>


        <button
          className="px-6 py-3 rounded-full bg-green-600 text-white"
        >

          Sign Up

        </button>

      </div>

    </nav>
  );
}



function FloatingCard({
  icon,
  title,
  status,
  price,
  className
}) {

  return (

    <div
      className={`absolute rounded-3xl bg-white p-4 shadow-xl flex gap-3 items-center ${className}`}
    >

      <div
        className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center text-white"
      >

        {icon}

      </div>


      <div>

        <h3
          className="font-bold"
        >

          {title}

        </h3>


        <p
          className="text-green-600 text-sm"
        >

          {status}

        </p>


        <p
          className="text-gray-500 text-xs"
        >

          {price}

        </p>

      </div>

    </div>

  );

}




function Feature({ icon, label }) {

  return (

    <div
      className="flex gap-3 items-center"
    >

      <div
        className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center"
      >

        {icon}

      </div>

      <span
        className="font-semibold whitespace-pre-line"
      >

        {label}

      </span>

    </div>

  );

}



function Stat({
  icon,
  value,
  label
}) {

  return (

    <div
      className="flex gap-3 items-center"
    >

      <div
        className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center"
      >

        {icon}

      </div>


      <div>

        <h2
          className="text-3xl font-black text-green-800"
        >

          {value}

        </h2>


        <p
          className="text-sm text-gray-500"
        >

          {label}

        </p>

      </div>

    </div>

  );

}



export default function Hero() {

  return (

    <section
      className="min-h-screen bg-[#F7FAF4]"
    >

      <Nav />



      <div
        className="max-w-7xl mx-auto px-6 py-16"
      >

        <div
          className="grid lg:grid-cols-2 gap-10 items-center"
        >

          {/* LEFT */}

          <div>

            <div
              className="inline-flex gap-2 bg-green-100 px-4 py-2 rounded-full"
            >

              <Leaf
                size={18}
              />

              Smart Equipment Sharing for Farmers

            </div>



            <h1
              className="mt-6 text-6xl font-black leading-tight"
            >

              <span
                className="text-green-900"
              >

                Access.
                Share.
                Grow.

              </span>

              <br />

              <span
                className="text-green-600"
              >

                Stronger Together.

              </span>

            </h1>



            <p
              className="mt-6 text-lg text-gray-500 max-w-xl"
            >

              KisanSetu connects farmers to share
              agricultural equipment easily,
              affordably and efficiently.

              Save costs, save time,
              grow more.

            </p>



            <div
              className="mt-8 flex gap-4"
            >

              <button
                className="bg-green-600 text-white px-7 py-4 rounded-full flex gap-2 items-center"
              >

                Browse Equipment

                <ArrowRight
                  size={18}
                />

              </button>



              <button
                className="border border-green-300 rounded-full px-7 py-4 flex gap-3 items-center"
              >

                <Play
                  size={18}
                />

                How It Works

              </button>

            </div>



            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10"
            >

              <Feature
                icon={<Tractor size={20} />}
                label={"Wide Range\nEquipment"}
              />

              <Feature
                icon={<ShieldCheck size={20} />}
                label={"Verified Owners\nSecure"}
              />

              <Feature
                icon={<Users size={20} />}
                label={"Affordable\nReliable"}
              />

              <Feature
                icon={<Star size={20} />}
                label={"Ratings\nReviews"}
              />

            </div>

          </div>


          {/* RIGHT */}
        <div className="relative h-[650px]">

    <div
        className="
        absolute inset-0
        rounded-[60px]
        overflow-hidden
        bg-gradient-to-br
        from-green-400
        via-green-600
        to-emerald-900
        "
    >

        <div
            className="
            absolute
            top-10
            left-10
            w-48
            h-48
            rounded-full
            bg-white/10
            blur-3xl
            "
        />

        <div
            className="
            absolute
            bottom-12
            right-12
            w-60
            h-60
            rounded-full
            bg-yellow-300/20
            blur-3xl
            "
        />

    </div>



    <motion.img

        src={mascot}

        className="
        absolute
        left-1/2
        bottom-0
        -translate-x-1/2
        h-[92%]
        object-contain
        "

        animate={{
            y:[0,-12,0]
        }}

        transition={{
            duration:4,
            repeat:Infinity
        }}

    />


    <motion.div

        animate={{
            y:[0,-8,0]
        }}

        transition={{
            duration:3,
            repeat:Infinity
        }}

    >

        <FloatingCard

            className="top-10 left-[-20px]"

            icon={<Tractor size={22}/>}

            title="2,100 Equipments"

            status="Punjab Region"

            price="Live Listings"

        />

    </motion.div>



    <motion.div

        animate={{
            y:[0,8,0]
        }}

        transition={{
            duration:4,
            repeat:Infinity
        }}

    >

        <FloatingCard

            className="bottom-24 right-[-20px]"

            icon={<Wheat size={22}/>}

            title="₹12L+"

            status="Farmer Income"

            price="Generated"

        />

    </motion.div>



    <div

        className="
        absolute
        top-1/2
        right-8
        h-16
        w-16
        rounded-full
        bg-white
        shadow-xl
        flex
        items-center
        justify-center
        "

    >

        <Sprout

            size={30}

            className="text-green-600"

        />

    </div>

</div>

          

        </div>



        <div
          className="
          mt-12
          bg-white
          rounded-[40px]
          p-8
          shadow-lg
          grid
          sm:grid-cols-4
          gap-6
          "
        >

          <Stat
            icon={<Users />}
            value="10K+"
            label="Happy Farmers"
          />

          <Stat
            icon={<Tractor />}
            value="2K+"
            label="Equipment Listed"
          />

          <Stat
            icon={<Handshake />}
            value="25K+"
            label="Bookings Completed"
          />

          <Stat
            icon={<Leaf />}
            value="50+"
            label="Districts Connected"
          />

        </div>

      </div>

    </section>

  );

}