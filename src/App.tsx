import { useState } from 'react'
import './App.css'

function App() {
    // State for search query
    const [searchQuery, setSearchQuery] = useState('')

    // State for selected tab
    const [selectedTab, setSelectedTab] = useState<'All Pets' | 'Dogs' | 'Cats' | 'Small Animals'>('All Pets')

    // States for filters
    const [breed, setBreed] = useState('')
    const [gender, setGender] = useState('')
    const [age, setAge] = useState('')

    // Handler functions
    const handleTabClick = (tab: 'All Pets' | 'Dogs' | 'Cats' | 'Small Animals') => {
        setSelectedTab(tab)
        // Reset filters when tab changes (optional)
        setBreed('')
        setGender('')
        setAge('')
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleBreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBreed(e.target.value)
    }

    const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGender(e.target.value)
    }

    const handleAgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAge(e.target.value)
    }

    // Example pet data (you can replace this with actual data)
    const pets = [
        { id: 1, type: 'Dog', breed: 'Labrador', gender: 'Male', age: '2' },
        { id: 2, type: 'Cat', breed: 'Siamese', gender: 'Female', age: '1' },
        // Add more pets as needed
    ]

    // Filter pets based on search and filters
    const filteredPets = pets.filter(pet => {
        // Filter by tab
        if (selectedTab !== 'All Pets' && pet.type !== selectedTab.slice(0, -1)) return false

        // Filter by search query
        if (searchQuery && !pet.breed.toLowerCase().includes(searchQuery.toLowerCase())) return false

        // Filter by breed
        if (breed && pet.breed !== breed) return false

        // Filter by gender
        if (gender && pet.gender !== gender) return false

        // Filter by age
        if (age && pet.age !== age) return false

        return true
    })

    return (
        <div className="App">
            <div className="container">
                {/* Search Bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by breed..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Tab Bar */}
                <div className="tab-bar">
                    {['All Pets', 'Dogs', 'Cats', 'Small Animals'].map(tab => (
                        <button
                            key={tab}
                            className={selectedTab === tab ? 'active' : ''}
                            onClick={() => handleTabClick(tab as 'All Pets' | 'Dogs' | 'Cats' | 'Small Animals')}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="filters">
                    {/* Breed Filter */}
                    <select value={breed} onChange={handleBreedChange}>
                        <option value="">All Breeds</option>
                        <option value="Labrador">Labrador</option>
                        <option value="Siamese">Siamese</option>
                        {/* Add more breeds as needed */}
                    </select>

                    {/* Gender Filter */}
                    <select value={gender} onChange={handleGenderChange}>
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    {/* Age Filter */}
                    <select value={age} onChange={handleAgeChange}>
                        <option value="">All Ages</option>
                        <option value="1">1 Year</option>
                        <option value="2">2 Years</option>
                        <option value="3">3 Years</option>
                        {/* Add more ages as needed */}
                    </select>
                </div>

                {/* Display Filtered Pets */}
                <div className="pet-list">
                    {filteredPets.length > 0 ? (
                        filteredPets.map(pet => (
                            <div key={pet.id} className="pet-card">
                                <h3>{pet.type}</h3>
                                <p>Breed: {pet.breed}</p>
                                <p>Gender: {pet.gender}</p>
                                <p>Age: {pet.age} Year(s)</p>
                            </div>
                        ))
                    ) : (
                        <p>No pets found matching your criteria.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default App