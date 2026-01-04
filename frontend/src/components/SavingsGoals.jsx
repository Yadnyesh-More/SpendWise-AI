// import React, { useState, useEffect } from 'react';
// import api from '../api';

// const SavingsGoals = ({ userId }) => {
//   const [goals, setGoals] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchGoals();
//   }, []);

//   const fetchGoals = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get('/goals', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setGoals(res.data.goals || []);
//     } catch (error) {
//       console.error('Goals error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateGoal = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
    
//     try {
//       await api.post('/goals', {
//         name: formData.get('name'),
//         target: parseFloat(formData.get('target')),
//         deadline: formData.get('deadline')
//       }, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       setShowForm(false);
//       e.target.reset();
//       fetchGoals();
//     } catch (error) {
//       console.error('Create goal error:', error);
//     }
//   };

//   const handleUpdateProgress = async (goalId, amount) => {
//     if (!amount) return;
    
//     try {
//       await api.put(`goals/${goalId}`, 
//         { amount: parseFloat(amount) },
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       fetchGoals();
//     } catch (error) {
//       console.error('Update goal error:', error);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <h3 className="text-2xl font-black text-white">🎯 Savings Goals</h3>
      
//       {loading ? (
//         <div className="flex justify-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {goals.map(goal => (
//             <div key={goal._id} className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/50 rounded-3xl p-6 hover:shadow-lg transition-shadow">
//               <h4 className="text-xl font-black text-emerald-100 mb-4">{goal.name}</h4>
              
//               {/* Progress Bar */}
//               <div className="w-full bg-emerald-900/50 rounded-full h-4 mb-4 overflow-hidden">
//                 <div 
//                   className="bg-gradient-to-r from-emerald-400 to-teal-400 h-4 rounded-full transition-all duration-300"
//                   style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
//                 ></div>
//               </div>
              
//               {/* Amount */}
//               <div className="text-2xl font-black text-emerald-100 mb-2">
//                 ₹{goal.current.toLocaleString()} / ₹{goal.target.toLocaleString()}
//               </div>
              
//               {/* Percentage */}
//               <div className="text-sm text-emerald-200 mb-4">
//                 {Math.round((goal.current / goal.target) * 100)}% Complete
//               </div>
              
//               {/* Add Amount */}
//               <input 
//                 type="number" 
//                 placeholder="Add amount" 
//                 className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" 
//                 onBlur={(e) => {
//                   if (e.target.value) {
//                     handleUpdateProgress(goal._id, e.target.value);
//                     e.target.value = '';
//                   }
//                 }}
//               />
              
//               {/* Deadline */}
//               <div className="text-xs text-emerald-300">
//                 📅 {new Date(goal.deadline).toLocaleDateString()}
//               </div>
//             </div>
//           ))}
          
//           {/* Create New Goal Button */}
//           <button 
//             onClick={() => setShowForm(!showForm)}
//             className="bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border-2 border-dashed border-emerald-400/50 rounded-3xl p-6 hover:bg-emerald-500/40 transition-all"
//           >
//             <div className="text-3xl mb-2">➕</div>
//             <p className="text-emerald-100 font-bold">New Goal</p>
//           </button>
//         </div>
//       )}
      
//       {/* Create Goal Form */}
//       {showForm && (
//         <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
//           <h4 className="text-xl font-black text-white mb-4">Create New Goal</h4>
//           <form onSubmit={handleCreateGoal} className="space-y-4">
//             <input 
//               name="name"
//               type="text" 
//               placeholder="Goal name (e.g., Emergency Fund)" 
//               required
//               className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
//             />
//             <input 
//               name="target"
//               type="number" 
//               placeholder="Target amount (₹)" 
//               required
//               className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
//             />
//             <input 
//               name="deadline"
//               type="date" 
//               required
//               className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
//             />
//             <div className="flex gap-2">
//               <button 
//                 type="submit"
//                 className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all"
//               >
//                 Create Goal
//               </button>
//               <button 
//                 type="button"
//                 onClick={() => setShowForm(false)}
//                 className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-all"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SavingsGoals;
