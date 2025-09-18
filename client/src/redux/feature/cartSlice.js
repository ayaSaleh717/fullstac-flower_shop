import { createSlice } from "@reduxjs/toolkit";


const initialState={
    cart:[],
}

 const cartSlice = createSlice({
    name:'cartSlice',
    initialState,
    reducers:{
        addToCart:(state,action)=>{
            
            const IteamIndex = state.cart.findIndex((iteam) => iteam._id === action.payload._id);

            if (IteamIndex >= 0) {
                state.cart[IteamIndex].qunty += action.payload.qunty;
            } else {
                const temp = { ...action.payload, qunty: action.payload.qunty }
                state.cart = [...state.cart, temp]

            }
        },
              // remove perticular iteams
        removeToCart:(state,action)=>{
            const data = state.cart.filter((ele)=>ele._id !== action.payload);
            state.cart = data;
        },


        
        // remove single iteams
        removeSingleIteams:(state,action)=>{
            const IteamIndex_dec = state.cart.findIndex((iteam) => iteam._id === action.payload._id);

            if(state.cart[IteamIndex_dec].qunty >=1){
                state.cart[IteamIndex_dec].qunty -= 1
            }

        },

        // clear cart
        emptycartIteam:(state,action)=>{
            state.cart = []
        },

        updateCartQuantity: (state, action) => {
            const { _id, qunty } = action.payload;
            const itemIndex = state.cart.findIndex((item) => item._id === _id);
            if (itemIndex >= 0) {
                state.cart[itemIndex].qunty = qunty;
            }
        }
    
        

            // state.cart = [...state.cart , action.payload];

        }
    

});


export const { addToCart,removeToCart,removeSingleIteams ,emptycartIteam, updateCartQuantity} = cartSlice.actions;

export default cartSlice.reducer;  