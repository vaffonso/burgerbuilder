import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';

import * as actions from '../../store/actions/index';

const burgerBuilder = props => {

  const [purchasing, setPurchasing] = useState(false);
  const {onInitIngredients} = props;

  useEffect(() => {
    onInitIngredients();
  }, [onInitIngredients])

  const purchaseHandler = () => {
    if (props.isAuthenticated) {
      setPurchasing(true);
    } else {
      props.onSetAuthRedirectPath('/checkout');
      props.history.push('/auth');
    }
  }

  const purchaseCancelHandler = () => {
    setPurchasing(false);
  }

  const purchaseContinueHandler = () => {
    props.onInitPurchase();
    props.history.push('/checkout');
  }

  const updatePurchaseState = (ingredients) => {

    const sum = Object.keys(ingredients)
      .map( igKey => {
        return ingredients[igKey];
      })
      .reduce( (sum, el) => {
        return sum + el;
      }, 0);

    return sum > 0;
  }

    const disableInfo = {
      ...props.ings
    }

    for (let key in disableInfo) {
      disableInfo[key] = disableInfo[key] <= 0
    }

    let orderSummary = null;
    let burguer = props.error ? <p>Ingredients can't be loaded</p>  : <Spinner />;

    if (props.ings) {

      orderSummary = <OrderSummary 
        ingredients={props.ings} 
        purchaseCanceled={purchaseCancelHandler}
        purchaseContinued={purchaseContinueHandler}
        price={props.price} />

      burguer = (
        <Aux>
          <Burger ingredients={props.ings} />
          <BuildControls 
            ingredientAdded={props.onIngredientAdded}
            ingredientRemove={props.onIngredientRemoved}
            disabled={disableInfo}
            price={props.price}
            purchasable={!updatePurchaseState(props.ings)}
            isAuth={props.isAuthenticated}
            ordered={() => purchaseHandler()}/>
        </Aux>
      )
    }

    // if (this.state.loading) {
    //   orderSummary = <Spinner />
    // }

    return (
      <Aux>
        <Modal 
          show={purchasing}
          modalClosed={purchaseCancelHandler}>
          { orderSummary }
        </Modal>
        { burguer }
      </Aux>
    );

}

const mapStateToProps = state => {
  return {
    ings: state.burgerBuilder.ingredients,
    price: state.burgerBuilder.totalPrice,
    error: state.burgerBuilder.error,
    isAuthenticated: state.auth.token !== null
  };
}

const mapDispatchtoProps = dispatch => {
  return {
    onIngredientAdded: (ingName) => dispatch(actions.addIngredient(ingName)),
    onIngredientRemoved: (ingName) => dispatch(actions.removeIngredient(ingName)),
    onInitIngredients: () => dispatch(actions.initIngredients()),
    onInitPurchase: () => dispatch(actions.purchaseInit()),
    onSetAuthRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path)) 
  }
}

export default connect(mapStateToProps, mapDispatchtoProps)(withErrorHandler(burgerBuilder, axios));