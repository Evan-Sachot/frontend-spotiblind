import {useState, useEffect} from 'react';

export const useAuthLogic = ()=>{
    const [isNewUser, setIsNewUser] = useState(false);
    const [username,setUsername]= useState("");
    const[token, setToken]= useState("");
    const [error, setError]=useState("");

    useEffect(()=>{
        const params = new URLSearchParams(window.location.search);
        const urlToken= params.get("token");
        const isNew = params.get("newUser")=== "true";

        if(urlToken){
            setToken(urlToken);
            localStorage.setItem("token", urlToken);
            if(isNew){
                setIsNewUser(true);
                window.history.replaceState({}, document.title, "/login");

            }else{
                window.location.href="/lobby";
            }
        }
    },[]);

    const handleSpotifyLogin = async()=>{
        window.location.href = "http://localhost:5000/api/auth/spotify";
    };
    const handleUsernameSubmit = async (e:React.FormEvent)=>{
        e.preventDefault();
        if(username.trim().length<3){
            setError("Pseudo doit faire au moins 3 caractères");
            return;
        }

        try{
            const response = await fetch("http://localhost:5000/api/users/update-username",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`
                },
                body:JSON.stringify({username}),
            });
            if(response.ok){
                window.location.href="/lobby";
            }else{
                setError("Erreur lors de la mise à jour du pseudo");
            }
        }catch(error){
            setError("Le serveur est inaccessible.");
        }
    }
    return{isNewUser, username, setUsername, error, handleSpotifyLogin, handleUsernameSubmit};
}