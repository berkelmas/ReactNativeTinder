import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View, Platform } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import {
  PanGestureHandler,
  State,
  TapGestureHandler
} from "react-native-gesture-handler";
import { useMemoOne } from "use-memo-one";
import { EvilIcons, Feather } from "@expo/vector-icons";
import { people as persons } from "../assets/data/people";

const {
  timing,
  eq,
  neq,
  block,
  Value,
  cond,
  set,
  event,
  add,
  and,
  clockRunning,
  not,
  startClock,
  stopClock,
  Clock,
  debug,
  decay,
  call,
  sub,
  spring,
  diffClamp,
  greaterOrEq,
  lessOrEq,
  greaterThan,
  lessThan,
  multiply,
  concat,
  abs,
  or
} = Animated;

const BottomCard = props => {
  const [people, setPeople] = useState(persons);
  const [currentIndex, setCurrentIndex] = useState(people.length - 1);
  const {gestureState, cardTransX, cardTransY, cardVelX, tapState, scaleVal, onLike, onDislike} = useMemoOne(() => ({
    gestureState : new Value(State.UNDETERMINED),
    cardTransX : new Value(0),
    cardTransY : new Value(0),
    cardVelX : new Value(0),
    tapState : new Value(State.UNDETERMINED),
    scaleVal : new Value(1),
    onLike : new Value(0) as Animated.Value<0 | 1>,
    onDislike : new Value(0) as Animated.Value<0 | 1>
  }), [])

  // HANDLE PAN EVENT HERE
  const handlePan = event([
    {
      nativeEvent: ({ state, translationX, translationY, velocityX }) =>
        block([
          set(gestureState, state),
          set(cardTransX, translationX),
          set(cardTransY, translationY),
          set(cardVelX, velocityX)
        ])
    }
  ]);

  // HANDLE LIKE TAP EVENT HERE
  const handleTapLike = event([
    {
      nativeEvent : ({state}) => block([
        set(gestureState, state),
        cond(eq(state, State.END), [
          set(cardVelX, 101),
          set(onLike, 1)
        ])
      ])
    }
  ])

  // HANDLE DISLIKE EVENT HERE
  const handleTapDislike = event([
    {
      nativeEvent : ({state}) => block([
        set(gestureState, state),
        cond(eq(state, State.END), [
          set(cardVelX, -101),
          set(onDislike, 1)
        ])
      ])
    }
  ])

  const withSpringX = (
    gestureState: Animated.Value<State>,
    value: Animated.Value<number>,
    vel: Animated.Value<number>
  ) => {
    const clock = new Clock();
    const offset = new Value(0);
    const state = {
      finished: new Value(0),
      position: new Value(0),
      velocity: new Value(0),
      time: new Value(0)
    };
    const config = {
      stiffness: new Value(100),
      mass: new Value(1),
      damping: new Value(10),
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
      toValue: new Value(0)
    };

    return block([
      cond(and(clockRunning(clock), eq(gestureState, State.BEGAN)), [
        debug("CATCHED ON START...", stopClock(clock))
      ]),
      cond(neq(gestureState, State.END), [
        set(state.finished, 0),
        set(state.position, add(offset, value))
      ]),
      cond(eq(gestureState, State.END), [
        cond(greaterThan(vel, 100), [
          cond(and(not(clockRunning(clock)), not(state.finished)), [
            set(state.time, 0),
            set(state.velocity, 0),
            set(config.toValue, 500),
            call([], () => setCurrentIndex(curr => curr - 1)),
            startClock(clock)
          ]),
          spring(clock, state, config),
          set(offset, state.position),
          cond(state.finished, [
            stopClock(clock),
          ])
        ]),
        cond(lessOrEq(vel, -100), [
          cond(and(not(clockRunning(clock)), not(state.finished)), [
            set(state.time, 0),
            set(config.toValue, -500),
            set(state.velocity, 0),
            call([], () => setCurrentIndex(curr => curr - 1 )),
            startClock(clock)
          ]),
          spring(clock, state, config),
          set(offset, state.position),
          cond(state.finished, [
            stopClock(clock)
          ])
        ]),
        cond(lessOrEq(abs(vel), 100), [
          cond(and(not(clockRunning(clock)), not(state.finished)), [
            debug("STATE : ", gestureState),
            set(state.time, 0),
            set(state.velocity, vel),
            // TO VALUE IS 0 FOR BOTH
            set(config.toValue, 0),
            debug("START CLOCK", startClock(clock))
          ]),
          spring(clock, state, config),
          set(offset, state.position),
          cond(state.finished, [
            debug("STOP CLOCK", stopClock(clock)),
          ])

        ])

      ]),
      state.position
    ]);
  };

  const withSpringY = (
    gestureState: Animated.Value<State>,
    value: Animated.Value<number>,
    vel: Animated.Value<number>
  ) => {
    const clock = new Clock();
    const offset = new Value(0);
    const state = {
      finished: new Value(0),
      position: new Value(0),
      velocity: new Value(0),
      time: new Value(0)
    };
    const config = {
      stiffness: new Value(100),
      mass: new Value(1),
      damping: new Value(10),
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
      toValue: new Value(0)
    };


    return block([
      cond(and(clockRunning(clock), eq(gestureState, State.BEGAN)), [
        debug("CATCHED ON START...", stopClock(clock))
      ]),
      cond(neq(gestureState, State.END), [
        set(state.finished, 0),
        set(state.position, add(offset, value))
      ]),
      cond(eq(gestureState, State.END), [
        cond(greaterThan(vel, 100), [
          cond(and(not(clockRunning(clock)), not(state.finished)), [
            set(state.time, 0),
            set(state.velocity, 0),
            set(config.toValue, 500),
            startClock(clock)
          ]),
          spring(clock, state, config),
          set(offset, state.position),
          cond(state.finished, [
            stopClock(clock),
            call([], () => setCurrentIndex(curr => curr - 1))
          ])
        ]),
        cond(lessOrEq(vel, -100), [
          cond(and(not(clockRunning(clock)), not(state.finished)), [
            set(state.time, 0),
            set(state.velocity, 0),
            set(config.toValue, 500),
            startClock(clock)
          ]),
          spring(clock, state, config),
          set(offset, state.position),
          cond(state.finished, [
            stopClock(clock),
            call([], () => setCurrentIndex(curr => curr - 1))
          ])
        ]),
        cond(lessOrEq(abs(vel), 100), [
          cond(and(not(clockRunning(clock)), not(state.finished)), [
            set(state.time, 0),
            set(state.velocity, vel),
            set(config.toValue, 0),
            startClock(clock)
          ]),
          spring(clock, state, config),
          set(offset, state.position),
          cond(state.finished, [
            stopClock(clock)
          ])
        ])

      ]),
      state.position
    ]);
  };

  const buttonWithSpring = (tapState: Animated.Value<State>, value: Animated.Value<number>, dest: number) => {
    const clockStart = new Clock();
    const clockEnd = new Clock();
    const offset = new Value(1);
    const stateStart = {
      finished: new Value(0),
      position: new Value(0),
      velocity: new Value(0),
      time: new Value(0)
    };
    const stateEnd = {
      finished: new Value(0),
      position: new Value(0),
      velocity: new Value(0),
      time: new Value(0)
    };
    const configStart = {
      stiffness: new Value(100),
      mass: new Value(1),
      damping: new Value(10),
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
      toValue: new Value(0)
    };
    const configEnd = {
      stiffness: new Value(100),
      mass: new Value(1),
      damping: new Value(10),
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
      toValue: new Value(0)
    };


    return block([
      cond(eq(tapState, State.BEGAN), [
        cond(and(not(clockRunning(clockStart)), not(stateStart.finished)), [
          cond(not(stateEnd.finished), [
            debug("STOP second ON began", stopClock(clockEnd)),
            set(stateEnd.finished, 0)
          ]),
          set(stateStart.position, value),
          set(stateStart.time, 0),
          set(configStart.toValue, dest),
          debug("START CLOCK BEGAN", startClock(clockStart))
        ]),
        spring(clockStart, stateStart, configStart),
        set(offset, stateStart.position),
        cond(stateStart.finished, [
          debug("STOP CLOCK BEGAN", stopClock(clockStart)),
          set(stateStart.finished, 0)
        ])
      ]),
      cond(eq(tapState, State.END), [
        cond(and(not(clockRunning(clockEnd)), not(stateEnd.finished)), [
          cond(not(stateStart.finished), [
            debug("STOP FIRST ON END", stopClock(clockStart)),
            set(stateStart.finished, 0)
          ]),
          set(stateEnd.position, offset),
          set(stateEnd.time, 0),
          set(configEnd.toValue, 1),
          debug("START CLOCK END", startClock(clockEnd))
        ]),
        spring(clockEnd, stateEnd, configEnd),
        set(offset, stateEnd.position),
        cond(stateEnd.finished, [
          debug("STOP CLOCK END", stopClock(clockEnd)),
          set(stateEnd.finished, 0)
        ])
      ]),
      offset
    ]);
  }

  const cardTransXSpring = withSpringX(gestureState, cardTransX, cardVelX);
  const cardTransYSpring = withSpringY(gestureState, cardTransY, cardVelX);

  const buttonScaleSpring = buttonWithSpring(gestureState, scaleVal, 0.9);
  const buttonShadowRad = Animated.interpolate(buttonScaleSpring, {
    inputRange: [0.9, 1],
    outputRange: [2, 3]
  })

  const rotateVal = Animated.interpolate(cardTransXSpring, {
    inputRange: [-100, 100],
    outputRange: [-6, 6]
  });
  const backScaleVal = diffClamp(Animated.interpolate(cardTransXSpring, {
    inputRange: [-300, 0, 300],
    outputRange: [1, 0.8, 1]
  }), 0.8, 1);

  const seenTextLiked = Animated.interpolate(cardTransXSpring, {
    inputRange: [-100, 0, 100],
    outputRange: [0, 0, 1]
  });

  const seenTextDisliked = Animated.interpolate(cardTransXSpring, {
    inputRange: [-100, 0, 100],
    outputRange: [1, 0, 0]
  })

  return (
    <View style={{ ...styles.container }}>
      <View style={{ ...styles.topHeader }}>
        <Text
          style={{
            color: "white",
            marginTop: 25,
            fontSize: 22,
            fontFamily: "Roboto-Light"
          }}
        >
          Tinders
        </Text>
      </View>
      <View style={{ ...styles.header }}>
        <Feather
          style={{ marginLeft: 20 }}
          name="user"
          size={32}
          color="gray"
        />
        <Feather
          style={{ marginRight: 20 }}
          name="message-circle"
          size={32}
          color="gray"
        />
      </View>
      <View style={{ ...styles.cardContainer }}>
        {people.map((person, index) => {
          if (index > currentIndex) {
            return null
          };

          if (index === currentIndex) {
            return (
              <React.Fragment key={person.id}>
              <PanGestureHandler
                onGestureEvent={handlePan}
                onHandlerStateChange={handlePan}
              >
                <Animated.View
                  style={[
                    styles.card,
                    {
                      transform: [
                        {
                          translateX: cardTransXSpring
                        },
                        {
                          translateY: cardTransYSpring
                        },
                        {
                          rotate: concat(rotateVal, "deg")        
                        }
                      ]
                    }
                  ]}
                >
                  <Animated.View style={{...styles.likeDislikeTextContainer, left : 50, borderColor : 'green', opacity : seenTextLiked, transform : [{rotate : '-30deg'}]}}>
                      <Text style={{color : 'green', fontSize : 32, fontWeight : '700'}}>LIKE</Text>
                  </Animated.View>

                  <Animated.View style={{...styles.likeDislikeTextContainer, right : 30, borderColor : 'red', opacity : seenTextDisliked, transform : [{rotate : '30deg'}]}}>
                      <Text style={{color : 'red', fontSize : 30, fontWeight : '700'}}>DISLIKE</Text>
                  </Animated.View>
                  <Image
                    style={{ height: "100%", width: "100%", borderRadius: 10 }}
                    source={person.image}
                  />
                  <View style={{ position: "absolute", bottom: 30, left: 20 }}>
                    <Text
                      style={{
                        color: "#f7f7f7",
                        fontSize: 45,
                        fontFamily: "Roboto-Thin"
                      }}
                    >
                      {person.name}
                    </Text>
                    <Text
                      style={{
                        color: "#f7f7f7",
                        fontSize: 40,
                        fontFamily: "Roboto-Thin"
                      }}
                    >
                      {person.age}
                    </Text>
                  </View>
                </Animated.View>
              </PanGestureHandler>
            </React.Fragment>
            ) 
          } else {

            return (
              <React.Fragment key={person.id}>
          
                <Animated.View
                  style={[
                    styles.card
                  ]}
                >
                  <Animated.View style={{...styles.likeDislikeTextContainer, left : 50, borderColor : 'green', opacity : 0, transform : [{rotate : '-30deg'}]}}>
                    <Text style={{color : 'green', fontSize : 32, fontWeight : '700'}}>LIKE</Text>
                  </Animated.View>

                  <Animated.View style={{...styles.likeDislikeTextContainer, right : 30, borderColor : 'red', opacity : 0, transform : [{rotate : '30deg'}]}}>
                      <Text style={{color : 'red', fontSize : 30, fontWeight : '700'}}>DISLIKE</Text>
                  </Animated.View>
                  <Image
                    style={{ height: "100%", width: "100%", borderRadius: 10 }}
                    source={person.image}
                  />
                  <View style={{ position: "absolute", bottom: 30, left: 20 }}>
                    <Text
                      style={{
                        color: "#f7f7f7",
                        fontSize: 45,
                        fontFamily: "Roboto-Thin"
                      }}
                    >
                      {person.name}
                    </Text>
                    <Text
                      style={{
                        color: "#f7f7f7",
                        fontSize: 40,
                        fontFamily: "Roboto-Thin"
                      }}
                    >
                      {person.age}
                    </Text>
                  </View>
                </Animated.View>
                
              </React.Fragment>
            )
          }

        })}
      </View>
      <View style={{ ...styles.footer }}>

        <TapGestureHandler onHandlerStateChange={handleTapLike}>
          <Animated.View style={{ ...styles.likeButton }}>
            <EvilIcons name="heart" size={50} color="#66bb6a" />
          </Animated.View>
        </TapGestureHandler>

        <TapGestureHandler onHandlerStateChange={handleTapDislike}>
          <Animated.View style={{ ...styles.dislikeButton }}>
            <EvilIcons name="close" size={50} color="#e53935" />
          </Animated.View>
        </TapGestureHandler>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topHeader: {
    height: 90,
    width: Dimensions.get("window").width,
    backgroundColor: "#29b6f6",
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: Platform.OS === "ios" ? 35 : 20
  },
  likeButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    alignItems: "center",

  },
  dislikeButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    alignItems: "center",
   
  },
  cardContainer: {
    width: Dimensions.get("window").width,
    height:(Dimensions.get("window").height * 12) / 20,
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    width: "90%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    position: "absolute",
    zIndex: 1000,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,

    elevation: 12
  },
  likeDislikeTextContainer : {
    position : 'absolute',
    top : 30,
    zIndex : 2,
    borderWidth : 4, 
    paddingVertical : 5,
    paddingHorizontal : 10
  }
});

export default BottomCard;
