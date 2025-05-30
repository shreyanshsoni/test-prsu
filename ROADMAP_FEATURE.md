# Academic Roadmaps Feature

This feature allows users to create and manage multiple academic roadmaps, each containing a custom selection of programs.

## Database Setup

Before using the feature, you need to create the required database tables:

1. Connect to your Neon Tech (PostgreSQL) database.
2. Run the SQL script located at `Backend/db/migrations/create_roadmaps_tables.sql`.

Example:

```bash
psql -h <your-db-host> -d <your-db-name> -U <your-username> -f Backend/db/migrations/create_roadmaps_tables.sql
```

## Testing the Feature

1. **Access the Roadmaps Interface**
   - Log in to your account.
   - Click on the "Academic Roadmaps" tab in the main navigation.

2. **Create a New Roadmap**
   - Click the "New Roadmap" button.
   - Enter a name for your roadmap (e.g., "Data Science Path").
   - Click "Create".

3. **Add Programs to a Roadmap**
   - Select your roadmap from the list.
   - In the "Available Programs" section, find a program you want to add.
   - Click the "Add" button next to the program.
   - The program should now appear in the "Programs in this Roadmap" section.

4. **Create Multiple Roadmaps**
   - Create another roadmap with a different focus (e.g., "Web Development").
   - Add some of the same programs to both roadmaps to test the multi-roadmap capability.

5. **Remove Programs from a Roadmap**
   - Click the trash icon next to a program in the "Programs in this Roadmap" section.
   - The program should be removed from only that roadmap but still be available in others.

6. **Delete a Roadmap**
   - Click the trash icon next to a roadmap in the roadmap list.
   - Confirm the deletion when prompted.
   - The roadmap should be removed without affecting your saved programs.

## API Endpoints

The following API endpoints are available for the roadmaps feature:

- `GET /api/roadmaps` - Get all roadmaps for the current user
- `POST /api/roadmaps` - Create a new roadmap
- `GET /api/roadmaps/{roadmapId}` - Get a specific roadmap
- `DELETE /api/roadmaps/{roadmapId}` - Delete a roadmap
- `GET /api/roadmaps/{roadmapId}/programs` - Get all programs in a roadmap
- `POST /api/roadmaps/{roadmapId}/programs` - Add a program to a roadmap
- `DELETE /api/roadmaps/{roadmapId}/programs/{programId}` - Remove a program from a roadmap

## Implementation Notes

- The feature uses a many-to-many relationship between roadmaps and programs.
- A program can be part of multiple roadmaps.
- Deleting a roadmap does not delete the programs it contains.
- All roadmaps belong to a specific user and cannot be shared (in this version).

## Future Enhancements

1. Roadmap sharing functionality
2. Collaborative roadmaps
3. Public/private roadmap visibility settings
4. Roadmap templates for common educational paths 