
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Shield, ShoppingBag } from "lucide-react";

const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

export default function HeroSection() {
  return (
    <motion.section 
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.4 }}
      className="relative py-24 px-6 overflow-hidden bg-white"
    >
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-20"></div>
      <div 
        className="absolute top-0 left-0 -z-10 w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(79, 70, 229, 0.1), transparent 30%), radial-gradient(circle at 20% 80%, rgba(79, 70, 229, 0.05), transparent 25%)'
        }}
      />
      
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div variants={cardVariants} className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Product Research
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Make The Right Choice,
            <br/>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Every Time.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Get unbiased, AI-powered insights from thousands of reviews to find the perfect product for your needs.
          </p>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <div className="sleek-card p-8 text-left">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-lg">Smart Analysis</h3>
            <p className="text-slate-600">AI analyzes thousands of reviews to give you the real pros and cons.</p>
          </div>

          <div className="sleek-card p-8 text-left">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-lg">Trusted Sources</h3>
            <p className="text-slate-600">Information from verified customer reviews and expert opinions.</p>
          </div>

          <div className="sleek-card p-8 text-left">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-5">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-lg">Best Prices</h3>
            <p className="text-slate-600">Instantly find the best deals and purchase options from trusted stores.</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
