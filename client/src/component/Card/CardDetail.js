import React, { useEffect, useState } from "react";
import "./card.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  removeToCart,
  removeSingleIteams,
  emptycartIteam,
  updateCartQuantity,
} from "./../../redux/feature/cartSlice";
import { updateUserBalance } from "./../../redux/feature/authSlice";
import { commitPurchase } from "./../../api/api";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const CartDetails = () => {
  const { cart } = useSelector((state) => state.allCart);

  const [totalprice, setPrice] = useState(0);
  const [totalquantity, setTotalQuantity] = useState(0);
  const { user } = useSelector((state) => state.auth); // Get user from Redux store

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // add to cart
  const handleIncrement = (e) => {
    if (user) {
      dispatch(addToCart(e));
    } else {
      toast.error("You need to login first!");
    }
  };

  // remove to cart
  const handleDecrement = (e) => {
    dispatch(removeToCart(e));
    toast.success("Item Remove From Your Cart");
  };

  // remove single item
  const handleSingleDecrement = (e) => {
    dispatch(removeSingleIteams(e));
  };

  // empty cart
  const emptycart = () => {
    dispatch(emptycartIteam());
    toast.success("Your Cart is Empty");
  };

  const handleQuantityChange = (e, product) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      dispatch(updateCartQuantity({ ...product, qunty: newQuantity }));
    } else if (e.target.value === "") {
      dispatch(updateCartQuantity({ ...product, qunty: 1 }));
    }
  };

  // Commit the purchase
  const handleCommitBuy = async () => {
    if (!user) {
      toast.error("You need to be logged in to make a purchase.");
      return;
    }

    if (user.balance < totalprice) {
      toast.error("Your balance is not enough to complete this purchase.");
      return;
    }

    try {
      const purchaseData = {
        userId: user._id,
        cart,
        total: totalprice,
      };
      console.log(cart.map((ele, ind) => {
        return {
          productId: ele._id,
          quantity: ele.qunty,
          price: ele.price,
          name: ele.name,
          image: ele.image,
        }
      }))

      await commitPurchase(purchaseData);

      // Dispatch actions to update the state
      dispatch(emptycartIteam());
      dispatch(updateUserBalance(user.balance - totalprice));
      console.log(totalprice)
      console.log(user.balance)

      toast.success("Purchase successful!");
    } catch (error) {
      toast.error(error.message || "Failed to commit purchase.");
    }
  };

  // count total price
  const total = () => {
    let totalprice = 0;
    cart.map((ele, ind) => {
      totalprice = (ele.price * ele.qunty )+ totalprice;
    });
    setPrice(totalprice);
    
  };

  // count total quantity
  const countquantity = () => {
    let totalquantity = 0;
    cart.forEach((ele) => {
      totalquantity = ele.qunty + totalquantity;
    });
    setTotalQuantity(totalquantity);
  };

  useEffect(() => {
    total();
  }, [cart]);

  useEffect(() => {
    countquantity();
  }, [cart]);
  return (
    <>
      <div className="row justify-content-center m-0">
        <div className="col-md-8 mt-5 mb-5 cardsdetails">
          <div className="card">
            <div className="card-header  p-3">
              <div className="card-header-flex">
                <h5 className="text-dark m-0">
                  Cart Calculation{cart.length > 0 ? `(${cart.length})` : ""}
                </h5>
                {cart.length > 0 ? (
                  <button
                    className="btn btn-danger mt-0 btn-sm"
                    onClick={emptycart}
                  >
                    <i className="fa fa-trash-alt mr-2"></i>
                    <span>EmptyCart</span>
                  </button>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="card-body p-0">
              {cart.length === 0 ? (
                <table className="table cart-table mb-0">
                  <tbody>
                    <tr>
                      <td colSpan={6}>
                        <div className="cart-empty">
                          <i className="fa fa-shopping-cart"></i>
                          <p>Your Cart Is Empty</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className="table cart-table mb-0 table-responsive-sm">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Product</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Quntity</th>
                      <th className="text-right">
                        {" "}
                        <span id="amount" className="amount">
                          Total Amount
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((data, index) => {
                      return (
                        <>
                          <tr>
                            <td>
                              <button
                                className="prdct-delete"
                                onClick={() => handleDecrement(data._id)}
                              >
                                <i className="fa fa-trash-alt"></i>
                              </button>
                            </td>
                            <td>
                              <div className="product-img">
                                <img 
                                  src={data.image || 'https://via.placeholder.com/100x100?text=No+Image'} 
                                  alt={data.proName || 'Product'}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/100x100?text=Image+Not+Available';
                                  }}
                                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="product-name">
                                <p>{data.proNAme}</p>
                              </div>
                            </td>
                            <td>${data.price}</td>
                            <td>
                              <div className="prdct-qty-container">
                                <button
                                  className="prdct-qty-btn"
                                  type="button"
                                  onClick={
                                    data.qnty <= 1
                                      ? () => handleDecrement(data.proId)
                                      : () => handleSingleDecrement(data)
                                  }
                                >
                                  <i className="fa fa-minus"></i>
                                </button>
                                <input
                                  type="text"
                                  className="qty-input-box"
                                  value={data.qunty}
                                  onChange={(e) => handleQuantityChange(e, data)}
                                  name=""
                                  id=""
                                />
                                <button
                                  className="prdct-qty-btn"
                                  type="button"
                                  onClick={() => handleIncrement(data)}
                                >
                                  <i className="fa fa-plus"></i>
                                </button>
                              </div>
                            </td>
                            <td className="text-right">
                              $ {data.qunty * data.price}
                            </td>
                          </tr>
                        </>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>&nbsp;</th>
                      <th colSpan={3}>&nbsp;</th>
                      <th>
                        Items In Cart <span className="ml-2 mr-2">:</span>
                        <span className="text-danger">{totalquantity}</span>
                      </th>
                      <th className="text-right">
                        Total Price<span className="ml-2 mr-2">:</span>
                        <span className="text-danger">$ {totalprice}</span>
                      </th>
                    </tr>
                    <tr>
                      <th colSpan={5}></th>
                      <th className="text-right">
                        <button
                          className="btn btn-success"
                          onClick={handleCommitBuy}
                          disabled={cart.length === 0}
                        >
                          Commit Buy
                        </button>
                      </th>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDetails;
