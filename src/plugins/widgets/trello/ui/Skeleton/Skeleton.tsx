import React from "react"
import Spinner from "../Spinner/Spinner";
import "./Skeleton.sass";

interface SkeletonProps {
  header: string;
}
export default function Skeleton({ header }: SkeletonProps) {
  return (
    <div className="skeleton">
      <h3 className="skeleton-header">{header}</h3>
      <div className="loader-container">
        <Spinner size={24}/>
      </div>
    </div> 
  )
}