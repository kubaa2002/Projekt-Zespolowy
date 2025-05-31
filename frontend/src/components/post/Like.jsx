

import { AiOutlineLike } from 'react-icons/ai';
import { FaThumbsUp} from "react-icons/fa";
const Like = ({ isLiked,handleLike,likesCount }) => {
  

    if(isLiked)
  return (
    <>
    <FaThumbsUp
                    className={`icon active`}
                    onClick={handleLike}
                  />
                  <span>{likesCount}</span>
      </>
  );

  if(!isLiked)
    return (
      <>
      <AiOutlineLike
                      className={`icon}`}
                      onClick={handleLike}
                    />
                    {likesCount}
        </>
    );
};


  
  

export default Like;
