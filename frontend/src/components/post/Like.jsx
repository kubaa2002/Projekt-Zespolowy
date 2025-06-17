

import { AiOutlineLike } from 'react-icons/ai';
import { FaThumbsUp} from "react-icons/fa";
const Like = ({ isLiked,handleLike,likesCount }) => {
  

    if(isLiked)
  return (
    <span onClick={handleLike}>
    <FaThumbsUp
                    className={`icon active`}
                    
                  />
                  <span>{likesCount}</span>
      </span>
  );

  if(!isLiked)
    return (
      <span onClick={handleLike}>
      <AiOutlineLike
                      className={`icon}`}
             
                    />
                    <span>{likesCount}</span>
        </span>
    );
};


  
  

export default Like;
