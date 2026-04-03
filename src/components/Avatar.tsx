import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { AvatarController } from "./AvatarController";

// CRITICAL: Export this so LessonPlayer can see it
export interface AvatarHandle {
  speak: (text: string) => void;
}

const Avatar = forwardRef<AvatarHandle, {}>((props, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AvatarController | null>(null);

  useEffect(() => {
    if (mountRef.current && !controllerRef.current) {
      controllerRef.current = new AvatarController(mountRef.current);
    }
    return () => {
      if (controllerRef.current) {
        controllerRef.current.dispose();
        controllerRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    speak: (text: string) => {
      if (controllerRef.current) {
        controllerRef.current.speak(text);
      }
    }
  }));

  return <div ref={mountRef} className="w-full h-full absolute inset-0" />;
});

export default Avatar;