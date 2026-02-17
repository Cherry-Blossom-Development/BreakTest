/**
 * External User Service
 *
 * Simulates actions from other users during demo recordings.
 * Uses direct database access for reliability (no auth/socket complexity).
 */

import mysql, { Connection, RowDataPacket } from 'mysql2/promise';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.demo') });

interface User {
    id: number;
    handle: string;
    firstName?: string;
    lastName?: string;
}

interface ChatRoom {
    id: number;
    name: string;
    description?: string;
}

interface ChatMessage {
    id: number;
    roomId: number;
    userId: number;
    message: string;
    createdAt: Date;
}

export class ExternalUserService {
    private connection: Connection | null = null;
    private userCache: Map<string, User> = new Map();
    private roomCache: Map<string, ChatRoom> = new Map();

    /**
     * Connect to the test database
     */
    async connect(): Promise<void> {
        if (this.connection) {
            return;
        }

        const config = {
            host: process.env.TEST_DB_HOST || 'localhost',
            port: parseInt(process.env.TEST_DB_PORT || '3306'),
            user: process.env.TEST_DB_USER || 'root',
            password: process.env.TEST_DB_PASS || '',
            database: process.env.TEST_DB_NAME || 'breakroom_test',
        };

        console.log(`ExternalUserService connecting to ${config.host}:${config.port}/${config.database}`);

        this.connection = await mysql.createConnection(config);
        console.log('ExternalUserService connected to database');
    }

    /**
     * Disconnect from the database
     */
    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
            this.userCache.clear();
            this.roomCache.clear();
            console.log('ExternalUserService disconnected');
        }
    }

    /**
     * Get a user by handle (with caching)
     */
    private async getUser(handle: string): Promise<User> {
        if (this.userCache.has(handle)) {
            return this.userCache.get(handle)!;
        }

        if (!this.connection) {
            throw new Error('Not connected to database');
        }

        const [rows] = await this.connection.query<RowDataPacket[]>(
            'SELECT id, handle, first_name, last_name FROM users WHERE handle = ?',
            [handle]
        );

        if (rows.length === 0) {
            throw new Error(`User not found: ${handle}`);
        }

        const user: User = {
            id: rows[0].id,
            handle: rows[0].handle,
            firstName: rows[0].first_name,
            lastName: rows[0].last_name,
        };

        this.userCache.set(handle, user);
        return user;
    }

    /**
     * Get a chat room by name (with caching)
     */
    private async getRoom(roomName: string): Promise<ChatRoom> {
        if (this.roomCache.has(roomName)) {
            return this.roomCache.get(roomName)!;
        }

        if (!this.connection) {
            throw new Error('Not connected to database');
        }

        const [rows] = await this.connection.query<RowDataPacket[]>(
            'SELECT id, name, description FROM chat_rooms WHERE name = ? AND is_active = 1',
            [roomName]
        );

        if (rows.length === 0) {
            throw new Error(`Chat room not found: ${roomName}`);
        }

        const room: ChatRoom = {
            id: rows[0].id,
            name: rows[0].name,
            description: rows[0].description,
        };

        this.roomCache.set(roomName, room);
        return room;
    }

    /**
     * Send a chat message as an external user
     *
     * @param fromUserHandle - The handle of the user sending the message
     * @param roomName - The name of the chat room
     * @param message - The message content
     * @returns The created message
     */
    async sendChatMessage(
        fromUserHandle: string,
        roomName: string,
        message: string
    ): Promise<ChatMessage> {
        if (!this.connection) {
            throw new Error('Not connected to database');
        }

        const user = await this.getUser(fromUserHandle);
        const room = await this.getRoom(roomName);

        console.log(`[${user.handle}] sending to [${room.name}]: "${message}"`);

        const [result] = await this.connection.query(
            'INSERT INTO chat_messages (room_id, user_id, message) VALUES (?, ?, ?)',
            [room.id, user.id, message]
        );

        const insertId = (result as any).insertId;

        return {
            id: insertId,
            roomId: room.id,
            userId: user.id,
            message: message,
            createdAt: new Date(),
        };
    }

    /**
     * Send multiple messages with delays between them
     *
     * @param messages - Array of {from, room, message, delay} objects
     */
    async sendMessageSequence(
        messages: Array<{
            from: string;
            room: string;
            message: string;
            delayMs?: number;
        }>
    ): Promise<void> {
        for (const msg of messages) {
            await this.sendChatMessage(msg.from, msg.room, msg.message);

            if (msg.delayMs) {
                await this.sleep(msg.delayMs);
            }
        }
    }

    /**
     * Clear all messages in a chat room (useful for demo reset)
     */
    async clearRoomMessages(roomName: string): Promise<number> {
        if (!this.connection) {
            throw new Error('Not connected to database');
        }

        const room = await this.getRoom(roomName);

        const [result] = await this.connection.query(
            'DELETE FROM chat_messages WHERE room_id = ?',
            [room.id]
        );

        const affectedRows = (result as any).affectedRows;
        console.log(`Cleared ${affectedRows} messages from ${roomName}`);
        return affectedRows;
    }

    /**
     * Add some initial messages to a room for demo purposes
     */
    async seedRoomWithMessages(
        roomName: string,
        messages: Array<{ from: string; message: string }>
    ): Promise<void> {
        console.log(`Seeding ${roomName} with ${messages.length} messages...`);

        for (const msg of messages) {
            await this.sendChatMessage(msg.from, roomName, msg.message);
            // Small delay to ensure message ordering
            await this.sleep(100);
        }

        console.log(`Seeded ${roomName} with messages`);
    }

    /**
     * Helper to sleep for a specified duration
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const externalUser = new ExternalUserService();

export default ExternalUserService;
