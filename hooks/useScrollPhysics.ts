import { useEffect, useRef, RefObject } from 'react';

// --- PHYSICS CONSTANTS ---
const SPRING_TENSION = 120; 
const SPRING_FRICTION = 20; 
const MASS = 1.5; 
const STOP_THRESHOLD = 0.5; // Pixels
const READING_ZONE_RATIO = 0.40; // 40% down from top

interface ScrollPhysicsOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  activeItemRef: RefObject<HTMLDivElement | null>;
  trigger: any; // Usually the activeGroupId to restart/re-evaluate
}

export function useScrollPhysics({ containerRef, activeItemRef, trigger }: ScrollPhysicsOptions) {
  
  // Physics State
  const physics = useRef({
      position: 0,
      velocity: 0,
      target: 0,
      lastTime: 0
  });

  // User Interaction State
  const isUserInteracting = useRef(false);
  const userInteractionTimeout = useRef<any>(null);

  // --- INTERACTION HANDLERS ---
  const handleUserInteraction = () => {
      isUserInteracting.current = true;
      if (userInteractionTimeout.current) clearTimeout(userInteractionTimeout.current);
      
      // Resume auto-scroll after 2 seconds of inactivity
      userInteractionTimeout.current = setTimeout(() => {
          isUserInteracting.current = false;
          // Sync physics to current scroll position to avoid jumping
          if (containerRef.current) {
              const currentScroll = containerRef.current.scrollTop;
              physics.current.position = currentScroll;
              physics.current.target = currentScroll;
              physics.current.velocity = 0;
          }
      }, 2000);
  };

  // Keep internal state synced if user drags scrollbar
  const handleScrollEvent = () => {
      if (isUserInteracting.current && containerRef.current) {
          physics.current.position = containerRef.current.scrollTop;
          physics.current.target = containerRef.current.scrollTop;
          physics.current.velocity = 0;
      }
  };

  // --- PHYSICS LOOP ---
  useEffect(() => {
    let animationFrameId: number;

    const updatePhysics = (time: number) => {
      const state = physics.current;
      const container = containerRef.current;
      
      if (!container) return;

      // Delta time (seconds) capped at 0.1s to prevent explosions on lag spikes
      const dt = Math.min((time - state.lastTime) / 1000, 0.1); 
      state.lastTime = time;

      // 1. Skip if user is touching
      if (isUserInteracting.current) {
          animationFrameId = requestAnimationFrame(updatePhysics);
          return;
      }

      // 2. Determine Target
      if (activeItemRef.current) {
          const activeEl = activeItemRef.current;
          const itemTop = activeEl.offsetTop;
          const itemHeight = activeEl.offsetHeight;
          const containerHeight = container.clientHeight;
          const maxScroll = container.scrollHeight - containerHeight;

          // Standard Reading Zone logic
          let idealScroll = itemTop - (containerHeight * READING_ZONE_RATIO);

          // Logic for very long text blocks (keeps bottom visible)
          if (itemHeight > containerHeight * 0.4) {
             const bottomTrackingOffset = containerHeight * 0.75;
             idealScroll = (itemTop + itemHeight) - bottomTrackingOffset;
          }
          
          state.target = Math.min(Math.max(0, idealScroll), maxScroll);
      } else {
          // Idle drift to bottom
          const maxScroll = container.scrollHeight - container.clientHeight;
          if (Math.abs(state.target - maxScroll) > 50) {
              state.target = maxScroll;
          }
      }

      // 3. Solve Spring Equation
      const displacement = state.position - state.target;
      const springForce = -SPRING_TENSION * displacement;
      const dampingForce = -SPRING_FRICTION * state.velocity;
      const acceleration = (springForce + dampingForce) / MASS;

      state.velocity += acceleration * dt;
      state.position += state.velocity * dt;

      // 4. Apply to DOM
      if (Math.abs(container.scrollTop - state.position) > STOP_THRESHOLD) {
          container.scrollTop = state.position;
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    // Initialize
    physics.current.lastTime = performance.now();
    if (containerRef.current) {
        physics.current.position = containerRef.current.scrollTop;
    }

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, [trigger]); // Re-evaluate when trigger (activeGroup.id) changes

  return {
    handleUserInteraction,
    handleScrollEvent
  };
}