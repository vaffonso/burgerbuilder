import React, { Component } from 'react';
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

class BurgerBuilder extends Component {
  constructor (props) {
    super(props);
    this.state = {
      purchasing: false
    }
  }

  componentDidMount = () => {
    this.props.onInitIngredients();
    // axios.get('https://react-my-burguer-f8e0d.firebaseio.com/ingredients.json')
    //   .then(response => {
    //     this.setState({ingredients: response.data});
    //   })
    //   .catch(error => {
    //     console.log(error);
    //     this.setState({error: true});
    //   });
  }

  purchaseHandler = () => {
    if (this.props.isAuthenticated) {
      this.setState( {purchasing: true} );
    } else {
      this.props.onSetAuthRedirectPath('/checkout');
      this.props.history.push('/auth');
    }
  }

  purchaseCancelHandler = () => {
    this.setState( {purchasing: false } );
  }

  purchaseContinueHandler = () => {
    this.props.onInitPurchase();
    this.props.history.push('/checkout');
  }

  updatePurchaseState = (ingredients) => {

    const sum = Object.keys(ingredients)
      .map( igKey => {
        return ingredients[igKey];
      })
      .reduce( (sum, el) => {
        return sum + el;
      }, 0);

    return sum > 0;
  }

  render () {
    
    const disableInfo = {
      ...this.props.ings
    }

    for (let key in disableInfo) {
      disableInfo[key] = disableInfo[key] <= 0
    }

    let orderSummary = null;
    let burguer = this.props.error ? <p>Ingredients can't be loaded</p>  : <Spinner />;

    if (this.props.ings) {

      orderSummary = <OrderSummary 
        ingredients={this.props.ings} 
        purchaseCanceled={this.purchaseCancelHandler}
        purchaseContinued={this.purchaseContinueHandler}
        price={this.props.price} />

      burguer = (
        <Aux>
          <Burger ingredients={this.props.ings} />
          <BuildControls 
            ingredientAdded={this.props.onIngredientAdded}
            ingredientRemove={this.props.onIngredientRemoved}
            disabled={disableInfo}
            price={this.props.price}
            purchasable={!this.updatePurchaseState(this.props.ings)}
            isAuth={this.props.isAuthenticated}
            ordered={() => this.purchaseHandler()}/>
        </Aux>
      )
    }

    if (this.state.loading) {
      orderSummary = <Spinner />
    }

    return (
      <Aux>
        <Modal 
          show={this.state.purchasing}
          modalClosed={this.purchaseCancelHandler}>
          { orderSummary }
        </Modal>
        { burguer }
      </Aux>
    );
  }
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

export default connect(mapStateToProps, mapDispatchtoProps)(withErrorHandler(BurgerBuilder, axios));