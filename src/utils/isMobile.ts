export const isMobile = () => {
   if (typeof window === "undefined") return false;
   return window.innerWidth <= 768;
  };
 /* 

 Desktop


   export const isMobile = () => {
   if (typeof window === "undefined") return false;
   return window.innerWidth <= 768;
  };
  

  Hardcoded mobile


   export const isMobile = () => true;


  */