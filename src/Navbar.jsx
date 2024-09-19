const Navbar = () => {
    return (
        <div className="bg-purple-500 text-white flex justify-between p-4">
            {/* Aquí irá el título o logo */}
            <h1 className="text-xl">Taller De Ingeniería en Software</h1>
            <div>
                {/* Aquí irá el ícono de la campana */}
                <button>
                    {/* Icono de campana */}
                    <span className="text-white">&#128276;</span>
                </button>
            </div>
        </div>
    );
};

export default Navbar;
