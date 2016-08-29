import React from 'react';
import {interpolate} from 'd3-interpolate';
import {spring, Motion} from 'react-motion';
import PureRenderComponent from './pure-render-component';

const propTypes = {
  animatedProps: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  onStart: React.PropTypes.func,
  onEnd: React.PropTypes.func,
  stiffness: React.PropTypes.number,
  damping: React.PropTypes.number,
  precision: React.PropTypes.number
};

class Animation extends PureRenderComponent {
  constructor(props) {
    super(props);
    this._updateInterpolator(props);
    this._renderChildren = this._renderChildren.bind(this);
    this._motionEndHandler = this._motionEndHandler.bind(this);
  }

  componentWillUpdate(props) {
    this._updateInterpolator(this.props, props);
    if (props.onStart) {
      props.onStart();
    }
  }

  /**
   * Update the interpolator function and assign it to this._interpolator.
   * @param {Object} oldProps Old props.
   * @param {Object} newProps New props.
   * @private
   */
  _updateInterpolator(oldProps, newProps) {
    this._interpolator = interpolate(
      this._extractAnimatedPropValues(oldProps),
      newProps ? this._extractAnimatedPropValues(newProps) : null
    );
  }

  /**
   * Extract the animated props from the entire props object.
   * @param {Object} props Props.
   * @returns {Object} Object of animated props.
   * @private
   */
  _extractAnimatedPropValues(props) {
    const {animatedProps, ...otherProps} = props;
    return animatedProps.reduce((result, animatedPropName) => {
      if (otherProps.hasOwnProperty(animatedPropName)) {
        result[animatedPropName] = otherProps[animatedPropName];
      }
      return result;
    }, {});
  }

  /**
   * Render the child into the parent.
   * @param {Number} i Number generated by the spring.
   * @returns {React.Component} Rendered react element.
   * @private
   */
  _renderChildren({i}) {
    const {children} = this.props;
    const interpolator = this._interpolator;
    const child = React.Children.only(children);
    const interpolatedProps = interpolator ? interpolator(i) : interpolator;

    return React.cloneElement(
      child,
      {
        ...child.props,
        ...interpolatedProps,
        // enforce re-rendering
        _animation: Math.random()
      }
    );
  }

  _motionEndHandler() {
    if (this.props.onEnd) {
      this.props.onEnd();
    }
  }

  render() {
    const defaultStyle = {i: 0};
    const style = {i: spring(1)};
    // In order to make Motion re-run animations each time, the random key is
    // always passed.
    // TODO: find a better solution for the spring.
    const key = Math.random();
    return (
      <Motion {...{defaultStyle, style, key}} onRest={this._motionEndHandler}>
        {this._renderChildren}
      </Motion>
    );
  }
}

Animation.propTypes = propTypes;
Animation.displayName = 'Animation';

export default Animation;
